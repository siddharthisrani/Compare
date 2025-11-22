import React from 'react'

export default function RecommendationCard({ onRecommend }) {
  const [interest, setInterest] = React.useState('web')
  const [maths, setMaths] = React.useState(false)

  function run() {
    const mapping = { web: ['fs-merm-6-2', 'fs-java-9-2'], data: ['ds-ai-12-4'], marketing: [] }
    onRecommend(mapping[interest] || [])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h4 className="font-semibold">Quick Recommendation</h4>
      <p className="text-sm text-gray-500">Answer two quick questions</p>
      <div className="mt-3 space-y-2">
        <div>
          <label className="text-sm">Area of interest</label>
          <select className="input w-full mt-1" value={interest} onChange={e => setInterest(e.target.value)}>
            <option value="web">Web & Apps</option>
            <option value="data">Data Science & AI</option>
            <option value="marketing">Digital Marketing</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Do you like maths?</label>
          <div className="mt-1">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={maths} onChange={e => setMaths(e.target.checked)} /> Yes</label>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={run}>Recommend</button>
          <button className="px-3 py-2 rounded border" onClick={() => { setInterest('web'); setMaths(false) }}>Reset</button>
        </div>
      </div>
    </div>
  )
}
