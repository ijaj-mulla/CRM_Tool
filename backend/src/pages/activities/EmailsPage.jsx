import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmailsPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Fetch emails from backend
  const fetchEmails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/emails');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  // Sync emails with Gmail
  const handleSync = async () => {
    setLoading(true);
    setSyncStatus('');
    try {
      const response = await axios.post('http://localhost:5000/api/emails/sync');
      setSyncStatus(`${response.data.newEmailsCount} new emails synced`);
      fetchEmails(); // Refresh the email list
    } catch (error) {
      console.error('Error syncing emails:', error);
      setSyncStatus('Error syncing emails');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Emails</h2>
          <div className="flex items-center gap-4">
            {syncStatus && (
              <span className="text-sm text-gray-600">{syncStatus}</span>
            )}
            <button
              onClick={handleSync}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Emails'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snippet</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emails.map((email) => (
                <tr key={email._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(email.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="truncate max-w-md">{email.snippet}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailsPage;