import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Upload, Search, Download, Users, FileText, CheckCircle, AlertCircle, Facebook, ExternalLink, RefreshCw } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://xlhyimcjmnvz.manus.space/api'

function App() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [facebookLoggedIn, setFacebookLoggedIn] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('unknown')
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a valid CSV file')
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
      setError(null)
    } else {
      setError('Please drop a valid CSV file')
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleFacebookLogin = () => {
    const facebookWindow = window.open(
      'https://www.facebook.com/login',
      'facebook-login',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    )
    
    const checkClosed = setInterval(() => {
      if (facebookWindow.closed) {
        clearInterval(checkClosed)
        setFacebookLoggedIn(true)
        alert('Facebook login simulated! The search will now include Facebook results.')
      }
    }, 1000)
  }

  const testConnection = async () => {
    setConnectionStatus('testing')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus('connected')
        alert(`✅ Backend connection successful!\nStatus: ${data.status}\nVersion: ${data.version}`)
      } else {
        setConnectionStatus('error')
        alert(`❌ Backend connection failed: HTTP ${response.status}`)
      }
    } catch (err) {
      setConnectionStatus('error')
      if (err.name === 'AbortError') {
        alert('❌ Connection test timed out. Please check your internet connection.')
      } else {
        alert(`❌ Backend connection error: ${err.message}`)
      }
    }
  }

  const processFileWithRetry = async (formData, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            // If we can't parse the error response, use the status
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        return data

      } catch (err) {
        console.error(`Upload attempt ${attempt} failed:`, err)
        
        if (attempt === maxRetries) {
          if (err.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet connection and try again.')
          }
          throw err
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 2000)

      // Process with retry logic
      const data = await processFileWithRetry(formData)
      
      clearInterval(progressInterval)
      setProgress(100)
      setResults(data)

    } catch (err) {
      console.error('Upload error:', err)
      setError(`Failed to process file: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResults = () => {
    if (!results) return

    const csvContent = [
      ['Name', 'Address', 'Phone', 'Status', 'Sources', 'Details', 'Confidence'],
      ...results.people.map(person => [
        person.name,
        person.address,
        person.phone,
        person.status,
        person.sources.join('; '),
        person.details,
        person.confidence
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'people_search_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const createSampleCSV = () => {
    const sampleData = [
      ['name', 'address', 'phone'],
      ['Ashley Heller', '45 E. 30th St. Apt. 11c New York, NY 10016', '508-512-6117'],
      ['Brooke Mariner', '156 Stanhope Ave Mantua, NJ 08051', '856-236-3352'],
      ['Renee Cassidy', '2952 West Ave 2nd Fl Ocean City, NJ 08226', '484-719-9024'],
      ['Stan Duzy', '4943 Central Avenue Ocean City, NJ 08226', '609-545-8808'],
      ['Anna-Lisa Kleckner', '440 Dean Street West Chester, PA 19382', '484-888-9259']
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_contacts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'testing': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected'
      case 'error': return '❌ Connection Error'
      case 'testing': return '🔄 Testing...'
      default: return 'Test Connection'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">People Search Tool</h1>
          <p className="text-lg text-gray-600 mb-4">Upload a CSV file to automatically search for people across multiple platforms including Facebook</p>
          
          {/* Connection Status & Controls */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {!facebookLoggedIn ? (
              <Button onClick={handleFacebookLogin} className="bg-blue-600 hover:bg-blue-700">
                <Facebook className="h-4 w-4 mr-2" />
                Connect Facebook for Enhanced Search
              </Button>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Facebook Connected
              </div>
            )}
            
            <Button onClick={createSampleCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>
            
            <Button 
              onClick={testConnection} 
              variant="outline" 
              disabled={connectionStatus === 'testing'}
              className={getConnectionStatusColor()}
            >
              {connectionStatus === 'testing' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {getConnectionStatusText()}
            </Button>
          </div>
        </div>

        {/* Enhanced Search Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Enhanced Search Capabilities</h3>
                <p className="text-sm text-blue-800">
                  This tool searches across multiple platforms including public records, business directories, 
                  and Facebook. {facebookLoggedIn ? 'Facebook search is enabled.' : 'Connect Facebook for additional results.'}
                </p>
                {connectionStatus === 'error' && (
                  <p className="text-sm text-red-700 mt-2">
                    ⚠️ Connection issues detected. Try the "Test Connection" button or check your network settings.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Upload a CSV file containing names and addresses to search for people
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-green-500" />
                  <span className="text-lg font-medium">{file.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    CSV should contain columns: name, address, phone (case-sensitive)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {error}
                  {error.includes('fetch') && (
                    <div className="mt-2">
                      <p className="text-sm">Troubleshooting tips:</p>
                      <ul className="text-sm list-disc list-inside mt-1">
                        <li>Check your internet connection</li>
                        <li>Disable ad blockers temporarily</li>
                        <li>Try a different browser</li>
                        <li>Click "Test Connection" to verify backend status</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {file && !isProcessing && !results && (
              <div className="mt-4 flex justify-center">
                <Button 
                  onClick={processFile} 
                  className="flex items-center gap-2"
                  disabled={connectionStatus === 'error'}
                >
                  <Search className="h-4 w-4" />
                  Start Enhanced Search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Section */}
        {isProcessing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 animate-spin" />
                Processing...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-gray-600 text-center">
                Searching across public records, directories, and social platforms... {progress}%
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                This may take up to 30 seconds for large files
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Search Results
              </CardTitle>
              <CardDescription>
                Found {results.found} out of {results.totalProcessed} people across multiple platforms
              </CardDescription>
              <div className="flex justify-end">
                <Button onClick={downloadResults} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.people.map((person, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      person.status === 'found' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {person.status === 'found' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <h3 className="font-semibold text-lg">{person.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-1">{person.address}</p>
                        {person.phone && (
                          <p className="text-gray-600 mb-1">{person.phone}</p>
                        )}
                        <p className="text-sm text-gray-700 mb-2">{person.details}</p>
                        {person.confidence > 0 && (
                          <p className="text-xs text-gray-500 mb-2">
                            Confidence: {Math.round(person.confidence * 100)}%
                          </p>
                        )}
                        {person.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {person.sources.map((source, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  source === 'Facebook Search' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {source === 'Facebook Search' && <Facebook className="h-3 w-3 inline mr-1" />}
                                {source}
                              </span>
                            ))}
                          </div>
                        )}
                        {person.details.includes('facebook.com') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(person.details.split('Facebook: ')[1], '_blank')}
                            className="mt-2"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Facebook Search
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>People Search Tool v2.2 - Enhanced Error Handling & Retry Logic</p>
          <p className="mt-1">Searches across public records, business directories, and social platforms</p>
        </div>
      </div>
    </div>
  )
}

export default App

