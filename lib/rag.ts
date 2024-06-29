import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import FormData from 'form-data'

async function uploadFile() {
  const url = 'https://api.unstructuredapp.io/general/v0/general'
  const apiKey = 'oWDV3tiWSrz7BybnWGNlgCeBWfRLZW'

  // Create a new FormData instance
  const formData = new FormData()

  // Append the file to the FormData
  formData.append('files', fs.createReadStream('public/excerpt.pdf'))

  // Add configuration options
  formData.append('include_page_breaks', 'false')
  formData.append('include_image_data', 'false')

  try {
    console.log('Sending request...')
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        accept: 'application/json',
        'unstructured-api-key': apiKey
      }
    })

    console.log('Response received:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)

    // Filter the response data
    const filteredData = response.data
      .filter((item: any) => {
        return item.type === 'NarrativeText' && !/^\d+$/.test(item.text.trim())
      })
      .map((item: any) => ({
        text: item.text,
        metadata: {
          page_number: item.metadata.page_number
        }
      }))

    // Create a versioned filename
    const version = '1' // Increment this for new versions
    const configCode = 'hrt' // h: hi_res, r: raw text, t: no tables
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .split('T')[0]
    const filename = `v${version}_${configCode}_${timestamp}.json`

    // Ensure the filename is not longer than 24 characters
    const truncatedFilename = filename.slice(0, 24)

    // Save the filtered data to a JSON file
    const outputPath = path.join(process.cwd(), truncatedFilename)
    fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2))
    console.log(`Filtered response data saved to: ${outputPath}`)

    // Log a summary of the filtered response
    console.log(
      'Filtered Data preview:',
      JSON.stringify(filteredData.slice(0, 2), null, 2)
    )
    console.log(`Full filtered response saved to ${outputPath}`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message)
      if (error.response) {
        console.error('Response Status:', error.response.status)
        console.error(
          'Response Data:',
          JSON.stringify(error.response.data, null, 2)
        )
      }
    } else {
      console.error('Unexpected Error:', error)
    }
  }
}

// Call the function
uploadFile()
