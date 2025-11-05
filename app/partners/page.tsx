'use client';

export default function PartnersPage() {
  const partners = [
    { name: '고양시 풋살파크', category: '경기장', discount: '20%' },
    { name: '스포츠카페 킥오프', category: '카페', discount: '10%' },
    { name: '올스포츠 용품점', category: '용품점', discount: '15%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">제휴 파트너</h1>
        <p className="text-gray-600 mb-6">Prism 포인트로 혜택을 받을 수 있는 제휴처입니다</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((partner, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{partner.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {partner.discount} 할인
                </span>
              </div>
              <p className="text-sm text-gray-500">{partner.category}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">더 많은 제휴처가 곧 추가됩니다!</p>
        </div>
      </div>
    </div>
  );
}
