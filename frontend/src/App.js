import React, { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/';

// Format API URL - handle both full URLs and hostnames from Render
const formatApiUrl = (url) => {
  // If it's just a hostname from Render (no protocol)
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  // Ensure URL ends with a slash
  return url.endsWith('/') ? url : `${url}/`;
};

const formattedApiUrl = formatApiUrl(API_BASE_URL);

function App() {
  const [transcripts, setTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'create', 'view'

  // Form states
  const [title, setTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize this meeting transcript in a clear, structured format with key points and action items.');
  const [editedSummary, setEditedSummary] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');

  // Load transcripts on component mount
  useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts`);
      const data = await response.json();
      setTranscripts(data.transcripts || []);
    } catch (error) {
      console.error('Error loading transcripts:', error);
    }
  };

  const createTranscript = async () => {
    if (!title.trim() || !originalText.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          original_text: originalText.trim(),
          custom_prompt: customPrompt.trim()
        }),
      });

      if (response.ok) {
        const newTranscript = await response.json();
        setCurrentTranscript(newTranscript);
        setEditedSummary('');
        loadTranscripts();
        setView('view');
        
        // Clear form
        setTitle('');
        setOriginalText('');
        setCustomPrompt('Summarize this meeting transcript in a clear, structured format with key points and action items.');
      } else {
        alert('Error creating transcript');
      }
    } catch (error) {
      console.error('Error creating transcript:', error);
      alert('Error creating transcript');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!currentTranscript) return;

    setLoading(true);
    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts/${currentTranscript.id}/generate-summary`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTranscript(prev => ({
          ...prev,
          generated_summary: data.summary
        }));
        setEditedSummary(data.summary);
      } else {
        alert('Error generating summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Error generating summary');
    } finally {
      setLoading(false);
    }
  };

  const saveSummary = async () => {
    if (!currentTranscript || !editedSummary.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts/${currentTranscript.id}/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          edited_summary: editedSummary.trim()
        }),
      });

      if (response.ok) {
        setCurrentTranscript(prev => ({
          ...prev,
          edited_summary: editedSummary.trim()
        }));
        alert('Summary saved successfully!');
        loadTranscripts();
      } else {
        alert('Error saving summary');
      }
    } catch (error) {
      console.error('Error saving summary:', error);
      alert('Error saving summary');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!currentTranscript || !emailRecipients.trim()) {
      alert('Please enter recipient email addresses');
      return;
    }

    const recipients = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
    if (recipients.length === 0) {
      alert('Please enter valid email addresses');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts/${currentTranscript.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: recipients,
          subject: emailSubject.trim() || 'Meeting Summary'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setEmailRecipients('');
        setEmailSubject('Meeting Summary');
      } else {
        alert('Error sending email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email');
    } finally {
      setLoading(false);
    }
  };

  const loadTranscript = async (transcriptId) => {
    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts/${transcriptId}`);
      if (response.ok) {
        const transcript = await response.json();
        setCurrentTranscript(transcript);
        setEditedSummary(transcript.edited_summary || transcript.generated_summary || '');
        setView('view');
      }
    } catch (error) {
      console.error('Error loading transcript:', error);
    }
  };

  const deleteTranscript = async (transcriptId) => {
    if (!window.confirm('Are you sure you want to delete this transcript?')) return;

    try {
      const response = await fetch(`${formattedApiUrl}api/transcripts/${transcriptId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadTranscripts();
        if (currentTranscript && currentTranscript.id === transcriptId) {
          setCurrentTranscript(null);
          setView('list');
        }
      } else {
        alert('Error deleting transcript');
      }
    } catch (error) {
      console.error('Error deleting transcript:', error);
      alert('Error deleting transcript');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 AI Meeting Notes Summarizer
          </h1>
          <p className="text-lg text-gray-600">
            Transform your meeting transcripts into structured summaries with AI
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`px-6 py-2 rounded-md transition-colors ${
                view === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 My Transcripts
            </button>
            <button
              onClick={() => setView('create')}
              className={`px-6 py-2 rounded-md transition-colors ${
                view === 'create' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ➕ New Transcript
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* List View */}
          {view === 'list' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Meeting Transcripts</h2>
              
              {transcripts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-600 text-lg">No transcripts yet</p>
                  <p className="text-gray-500">Create your first transcript to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transcripts.map((transcript) => (
                    <div key={transcript.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{transcript.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            Created: {new Date(transcript.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transcript.generated_summary ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {transcript.generated_summary ? '✅ Summary Generated' : '⏳ No Summary'}
                            </span>
                            {transcript.edited_summary && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                ✏️ Edited
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => loadTranscript(transcript.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteTranscript(transcript.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create View */}
          {view === 'create' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Transcript</h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Weekly Team Standup - Jan 15, 2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Original Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Transcript *
                  </label>
                  <TextareaAutosize
                    minRows={8}
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="Paste your meeting transcript, call notes, or any text you want to summarize..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Instructions
                  </label>
                  <TextareaAutosize
                    minRows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="How would you like the AI to summarize this content?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: "Summarize in bullet points for executives" or "Highlight only action items and deadlines"
                  </p>
                </div>

                <button
                  onClick={createTranscript}
                  disabled={loading || !title.trim() || !originalText.trim()}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? '⏳ Creating...' : '🚀 Create Transcript'}
                </button>
              </div>
            </div>
          )}

          {/* View/Edit Transcript */}
          {view === 'view' && currentTranscript && (
            <div className="space-y-6">
              {/* Transcript Header */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentTranscript.title}</h2>
                    <p className="text-gray-600 text-sm">
                      Created: {new Date(currentTranscript.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setView('list')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    ← Back to List
                  </button>
                </div>

                {/* Original Transcript */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Original Transcript</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">{currentTranscript.original_text}</p>
                  </div>
                </div>

                {/* Custom Prompt */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary Instructions</h3>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-blue-800 italic">{currentTranscript.custom_prompt}</p>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">AI Summary</h3>
                  <button
                    onClick={generateSummary}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '⏳ Generating...' : '🤖 Generate Summary'}
                  </button>
                </div>

                {currentTranscript.generated_summary || editedSummary ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Editable Summary
                      </label>
                      <TextareaAutosize
                        minRows={8}
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="AI summary will appear here..."
                      />
                    </div>
                    <button
                      onClick={saveSummary}
                      disabled={loading || !editedSummary.trim()}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {loading ? '⏳ Saving...' : '💾 Save Summary'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🤖</div>
                    <p>Click "Generate Summary" to create an AI-powered summary</p>
                  </div>
                )}
              </div>

              {/* Email Section */}
              {(currentTranscript.generated_summary || currentTranscript.edited_summary) && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📧 Share Summary via Email</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Meeting Summary"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipients (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      onClick={sendEmail}
                      disabled={loading || !emailRecipients.trim()}
                      className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                    >
                      {loading ? '⏳ Sending...' : '📤 Send Email'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;