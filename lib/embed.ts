import axios from 'axios'
import * as fs from 'fs'

async function getEmbedding(filename: string): Promise<number[]> {
  const fileContent = fs.readFileSync(filename, 'utf-8')
  const apiUrl = 'https://api.voyageai.com/v1/embeddings'

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'voyage-02',
        input: fileContent
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer XXX`
        }
      }
    )

    return response.data.data[0].embedding
  } catch (error) {
    console.error('Error getting embedding:', error)
    throw error
  }
}

// Usage
getEmbedding('public/output-rendered.txt')
  .then(embedding => {
    console.log(embedding)
  })
  .catch(error => {
    console.error('Error:', error)
  })
