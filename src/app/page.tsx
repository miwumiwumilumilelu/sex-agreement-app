import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in relative">
      {/* 浮动心形装饰 */}
      <div className="floating-hearts">
        {[...Array(8)].map((_, i) => {
          const hearts = ['❤️', '💕', '💖', '💗', '💝', '💘', '💞', '💓'];
          return (
            <div
              key={i}
              className="floating-heart"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`
              }}
            >
              {hearts[i % hearts.length]}
            </div>
          );
        })}
      </div>
      
      <div className="modern-card p-12 max-w-5xl w-full mx-4 sparkle wave-effect">
        <h1 className="text-5xl font-bold text-center mb-8 gradient-text animate-bounce-in">
          性行为同意协议系统
        </h1>

        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-xl mb-6 text-gray-700 leading-relaxed">
            欢迎使用性行为同意协议系统。本系统旨在帮助用户创建合法有效的性行为同意协议，确保各方权益得到保障。
          </p>
          <p className="text-lg mb-8 text-gray-600">
            通过本系统，您可以创建、查看和管理性行为同意协议，所有数据均存储在本地，保障您的隐私安全。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full mb-12">
          <Link href="/create" className="modern-button btn btn-lg w-full text-white font-semibold py-4 px-8 rounded-xl animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            创建新协议
          </Link>
              <Link href="/agreements" className="btn btn-outline btn-lg w-full font-semibold py-4 px-8 rounded-xl border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            查看我的协议
          </Link>
        </div>

            <div className="modern-card p-8 max-w-4xl w-full bg-gradient-to-br from-purple-50 to-pink-50 border-0 decorative-dots">
          <h2 className="text-2xl font-bold mb-6 text-center gradient-text animate-rotate-in">关于性同意协议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">性同意协议是双方或多方在进行性活动前达成的明确同意</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">协议内容包括同意的范围、安全措施、隐私保护等</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">任何一方均有权随时撤回同意</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">协议遵循自愿、平等、真实的原则</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">本系统生成的协议可打印出来供双方手签</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
