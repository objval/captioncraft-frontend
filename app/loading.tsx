export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mb-8 mx-auto">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <div className="absolute inset-0 h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse opacity-50 mx-auto"></div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-2 w-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className="text-slate-600 font-medium">Loading Kalil...</p>
          <p className="text-slate-500 text-sm">Preparing your AI video captioning experience</p>
        </div>
      </div>
    </div>
  )
}