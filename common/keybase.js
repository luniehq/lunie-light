import { keyBy, uniqBy } from 'lodash'

/*
 Images are stored in localstorage under 'keybase' in a dictionary:
 {
    keybaseHash: {
        picture,
        updated
    }
 }
 This allows to reuse the images also cross networks
*/

const UPDATE_THROTTLE_PERIOD = 1000 * 60 * 60 * 24 * 2 // 2 days
const LOCALSTORAGE_KEY = 'keybase'

async function queryKeybaseImages(keybaseImageRecords) {
  const updatedKeybaseImages = await Promise.all(
    keybaseImageRecords.map(async ({ keybaseHash }) => {
      const query = `https://keybase.io/_/api/1.0/user/user_search.json?q=${keybaseHash}&num_wanted=1`
      try {
        const result = await fetch(query).then((res) => res.json())
        if (result.list.length > 0) {
          return {
            keybaseHash,
            picture: result.list[0].keybase.picture_url
              ? result.list[0].keybase.picture_url.replace(
                  'http://',
                  'https://'
                )
              : undefined,
            updated: new Date(),
          }
        }
        // no profile found
        return {
          keybaseHash,
          updated: new Date(),
        }
      } catch (error) {
        // error, try again next time
        return {
          keybaseHash,
        }
      }
    })
  )
  return keyBy(updatedKeybaseImages, 'keybaseHash')
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

export async function updateValidatorImages(currentValidators) {
  const updateableKeybaseHashes = getUpdateableKeybaseEntries(currentValidators)
  const updatedKeybaseHashes = await queryKeybaseImages(updateableKeybaseHashes)
  saveKeybaseImages(updatedKeybaseHashes)
  return enrichtValidatorsWithPicture(currentValidators)
}

export function enrichtValidatorsWithPicture(validators) {
  const validatorImageRecords = loadKeybaseImages()
  return validators.map((validator) => {
    const imageRecord = validatorImageRecords[validator.identity]
    return {
      ...validator,
      picture: imageRecord ? imageRecord.picture : undefined,
    }
  })
}
