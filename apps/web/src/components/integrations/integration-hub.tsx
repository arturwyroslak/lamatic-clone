'use client'

import React from 'react'

export function IntegrationHub() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Integrations</h2>
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Integration Hub</h3>
        <p>Browse and connect to 150+ integrations.</p>
        <div className="mt-4 space-y-2">
          <div className="border rounded p-3">
            <h4 className="font-medium">OpenAI GPT-4</h4>
            <p className="text-sm text-gray-600">Advanced language model for text generation</p>
          </div>
          <div className="border rounded p-3">
            <h4 className="font-medium">Slack</h4>
            <p className="text-sm text-gray-600">Team communication and collaboration</p>
          </div>
          <div className="border rounded p-3">
            <h4 className="font-medium">PostgreSQL</h4>
            <p className="text-sm text-gray-600">Powerful relational database</p>
          </div>
        </div>
      </div>
    </div>
  )
}
