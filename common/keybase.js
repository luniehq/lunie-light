async function loadKeybaseImages(validators) {
  const updatedValidators = await Promise.all(
    validators
      .filter(({ identity }) => !!identity)
      .map(async ({ operatorAddress, identity: keybaseHash }) => {
        const query = `https://keybase.io/_/api/1.0/user/user_search.json?q=${keybaseHash}&num_wanted=1`
        try {
          const result = await fetch(query).then((res) => res.json())
          if (result.list.length > 0) {
            return {
              operatorAddress,
              picture: result.list[0].keybase.picture_url
                ? result.list[0].keybase.picture_url.replace(
                    'http://',
                    'https://'
                  )
                : undefined,
              updated: new Date(),
            }
          }
          return {
            operatorAddress,
            updated: new Date(),
          }
        } catch (error) {
          return {
            operatorAddress,
          }
        }
      })
  )
  return updatedValidators
}

function loadValidatorImages() {
  const validatorImageRecords = JSON.parse(
    localStorage.getItem('keybase') || '[]'
  )
  return validatorImageRecords
}

function saveValidatorImages(validatorImageRecords) {
  const oldValidatorImageRecords = loadValidatorImages()
  const mergedValidatorImageRecords = oldValidatorImageRecords
    .filter(
      ({ operatorAddress }) =>
        !validatorImageRecords.find(
          (validator) => validator.operatorAddress === operatorAddress
        )
    )
    .concat(validatorImageRecords)
  localStorage.setItem('keybase', JSON.stringify(mergedValidatorImageRecords))
}

// get not yet loaded validators and outdated validators
function getUpdateableValidatorImageRecords(currentValidators) {
  const validatorImageRecords = loadValidatorImages()
  const updateableImageRecords = validatorImageRecords.filter(
    ({ updated }) =>
      !updated ||
      Date.now() - new Date(updated).getTime() > 1000 * 60 * 60 * 24 * 2
  ) // update every 2 days
  return currentValidators
    .filter(
      ({ operatorAddress }) =>
        !validatorImageRecords.find(
          (validator) => validator.operatorAddress === operatorAddress
        )
    )
    .concat(
      currentValidators.filter(({ operatorAddress }) =>
        updateableImageRecords.find(
          (validator) => validator.operatorAddress === operatorAddress
        )
      )
    )
}

export async function updateValidatorImages(currentValidators) {
  const updateableValidators = getUpdateableValidatorImageRecords(
    currentValidators
  )
  const updatedValidatorImages = await loadKeybaseImages(updateableValidators)
  saveValidatorImages(updatedValidatorImages)
  return enrichtValidatorsWithPicture(currentValidators)
}

export function enrichtValidatorsWithPicture(validators) {
  const validatorImageRecords = loadValidatorImages()
  return validators.map((validator) => {
    const imageRecord = validatorImageRecords.find(
      ({ operatorAddress }) => validator.operatorAddress === operatorAddress
    )
    return {
      ...validator,
      picture: imageRecord ? imageRecord.picture : undefined,
    }
  })
}
