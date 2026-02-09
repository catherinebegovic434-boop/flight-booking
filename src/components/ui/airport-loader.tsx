'use client';

export default function AirportLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-64 h-64">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0090da" />
                <stop offset="100%" stopColor="#cc2127" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              strokeDasharray="5,5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>

            <circle
              cx="100"
              cy="100"
              r="60"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 100 100"
                to="0 100 100"
                dur="6s"
                repeatCount="indefinite"
              />
            </circle>

            <g transform="translate(100, 100)">
              <path
                d="M -15 -3 L 20 -3 L 25 0 L 20 3 L -15 3 L -20 0 Z M 12 -3 L 14 -10 L 17 -10 L 15 -3 Z M 12 3 L 14 10 L 17 10 L 15 3 Z M -10 -3 L -8 -8 L -5 -8 L -7 -3 Z M -10 3 L -8 8 L -5 8 L -7 3 Z"
                fill="url(#planeGrad)"
                filter="url(#glow)"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
            </g>

            <circle cx="40" cy="60" r="2" fill="#0090da" opacity="0.6">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="60" r="2" fill="#cc2127" opacity="0.6">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="140" r="2" fill="#cc2127" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="140" r="2" fill="#0090da" opacity="0.6">
              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-black text-white">TICKETSHWARI</h2>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-blue-200 text-sm font-medium">Preparing your flight experience...</p>
        </div>
      </div>
    </div>
  );
}
