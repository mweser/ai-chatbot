import axios from 'axios'
import { config } from 'dotenv'
import FormData from 'form-data'
import * as fs from 'fs'
import * as path from 'path'
config()

async function uploadFile() {
  const url = 'https://api.unstructuredapp.io/general/v0/general'
  const apiKey = process.env.UNSTRUCTURED_API_KEY
  const formData = new FormData()
  formData.append('files', fs.createReadStream('public/excerpt2.pdf'))
  formData.append('include_page_breaks', 'false')

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

    const version = '1' // Increment this for new versions
    const timestamp = new Date().toISOString()
    const filename = `v${version}_${timestamp}`
    const truncatedFilename = filename.slice(0, 24)

    const outputPath = path.join(
      process.cwd(),
      `public/${truncatedFilename}.json`
    )
    fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2))
    console.log(`Filtered response data saved to: ${outputPath}`)

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

uploadFile()
