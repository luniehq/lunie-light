import axios from 'axios'
import { keyBy, uniqBy, chunk } from 'lodash'

/*
 Images are stored in localstorage under 'keybase' in a dictionary:
 {
    keybaseHash: {
        picture,
        updated
    }
 }
 This allows us to reuse the images across networks
*/

const UPDATE_THROTTLE_PERIOD = 1000 * 60 * 60 * 24 * 2 // 2 days
const CHUNK_SIZE = 50 // chunks of parallel requests against keybase API
const CHUNK_THROTTLE = 3000 // time between chunks to not get locked out of keybase
const LOCALSTORAGE_KEY = 'keybase'

async function queryKeybaseImage({ keybaseHash }) {
  const query = `https://keybase.io/_/api/1.0/user/user_search.json?q=${keybaseHash}&num_wanted=1`
  const { data: result } = await axios.get(query)
  if (result.list.length > 0) {
    return {
      keybaseHash,
      picture: result.list[0].keybase.picture_url
        ? result.list[0].keybase.picture_url.replace('http://', 'https://')
        : undefined,
      updated: new Date(),
    }
  }
  // no profile found
  return {
    keybaseHash,
    updated: new Date(),
  }
}

async function queryKeybaseImages(keybaseImageRecords, onChunkReady) {
  return await chunk(keybaseImageRecords, CHUNK_SIZE).reduce(
    async (all, keybaseImageRecords, index) => {
      const previous = await all
      if (index > 0)
        await new Promise((resolve) => setTimeout(resolve, CHUNK_THROTTLE))

      const updatedKeybaseImages = await Promise.all(
        keybaseImageRecords.map(async (record) => {
          try {
            return await queryKeybaseImage(record)
          } catch (error) {
            return {
              keybaseHash: record.keybaseHash,
            }
          }
        })
      )
      onChunkReady(keyBy(updatedKeybaseImages, 'keybaseHash')) // allow to react to chunks
      return {
        ...previous,
        ...keyBy(updatedKeybaseImages, 'keybaseHash'),
      }
    },
    {}
  )
}

function loadKeybaseImages() {
  const keybaseImages = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEY) || '{}'
  )
  return keybaseImages
}

function saveKeybaseImages(keybaseImages) {
  const oldKeybaseImages = loadKeybaseImages()
  const mergedKeybaseImages = {
    ...oldKeybaseImages,
    ...keybaseImages,
  }
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(mergedKeybaseImages))
}

// get not yet loaded validators and outdated validators
function getUpdateableKeybaseEntries(currentValidators) {
  const keybaseImages = loadKeybaseImages()
  const updateableKeybaseImages = Object.values(keybaseImages).filter(
    ({ updated }) =>
      !updated ||
      Date.now() - new Date(updated).getTime() > UPDATE_THROTTLE_PERIOD
  ) // update every 2 days
  return uniqBy(
    updateableKeybaseImages.concat(
      // add hashes we don't know yet
      currentValidators
        .filter(({ identity }) => !!identity && !keybaseImages[identity])
        .filter(({ identity }) => identity.length === 16)
        .map(({ identity }) => ({ keybaseHash: identity }))
    ),
    'keybaseHash'
  )
}

export async function updateValidatorImages(currentValidators, onChunkReady) {
  const updateableKeybaseHashes = getUpdateableKeybaseEntries(currentValidators)

  const nonUpdateableValidators = currentValidators.filter(
    ({ identity }) =>
      !updateableKeybaseHashes.find(
        ({ keybaseHash }) => identity === keybaseHash
      )
  )
  onChunkReady(enrichedValidatorsWithPicture(nonUpdateableValidators))

  await queryKeybaseImages(
    updateableKeybaseHashes,
    // callback on every chunk
    (updatedKeybaseHashes) => {
      saveKeybaseImages(updatedKeybaseHashes)
      onChunkReady(
        enrichedValidatorsWithPicture(
          currentValidators.filter(
            ({ identity }) => updatedKeybaseHashes[identity]
          )
        )
      )
    }
  )

  return enrichedValidatorsWithPicture(currentValidators)
}

export function enrichedValidatorsWithPicture(validators) {
  const validatorImageRecords = loadKeybaseImages()
  return validators.map((validator) => {
    const imageRecord = validatorImageRecords[validator.identity]
    return {
      ...validator,
      picture: imageRecord ? imageRecord.picture : undefined,
    }
  })
}
