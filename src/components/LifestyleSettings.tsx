import React, { useEffect, useState } from 'react';
import { Settings } from '../utils/CostCalculator';

interface LifestyleSettingsProps {
  settings: Settings;
  onSettingChange: (key: keyof Settings, value: unknown) => void;
}

// 标签类型
type TabType = 'housing' | 'daily' | 'education';

const LifestyleSettings: React.FC<LifestyleSettingsProps> = ({ settings, onSettingChange }) => {
  // 添加激活标签状态
  const [activeTab, setActiveTab] = useState<TabType>('housing');
  // 添加移动设备检测
  const [isMobile, setIsMobile] = useState(false);
  
  // 检测设备类型
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // 当子女数量变化时，调整educationTypes数组
  useEffect(() => {
    const currentCount = settings.educationTypes.length;
    const targetCount = settings.childrenCount;
    
    if (currentCount < targetCount) {
      // 需要添加更多教育阶段选项
      const newTypes = [...settings.educationTypes];
      for (let i = currentCount; i < targetCount; i++) {
        newTypes.push('kindergarten'); // 默认添加幼儿园
      }
      onSettingChange('educationTypes', newTypes);
    } else if (currentCount > targetCount) {
      // 需要减少教育阶段选项
      onSettingChange('educationTypes', settings.educationTypes.slice(0, targetCount));
    }
  }, [settings.childrenCount]);

  // 处理单个教育阶段变更
  const handleEducationTypeChange = (index: number, value: string) => {
    const newTypes = [...settings.educationTypes];
    newTypes[index] = value;
    onSettingChange('educationTypes', newTypes);
  };

  useEffect(() => {
    // 当子女数量变为0时，清空教育阶段
    if (settings.childrenCount === 0 && settings.educationTypes.length > 0) {
      onSettingChange('educationTypes', []);
    }
  }, [settings.childrenCount, settings.educationTypes, onSettingChange]);

  // 住房设置标签内容
  const renderHousingTab = () => (
    <div className="mt-4">
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="flex flex-col">
          <label htmlFor="housingType" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">住房方式</label>
          <select 
            id="housingType" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.housingType} 
            onChange={(e) => onSettingChange('housingType', e.target.value)}
          >
            <option value="rent">租房</option>
            <option value="buy">购房</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="housingLocation" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">住房位置</label>
          <select 
            id="housingLocation" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.housingLocation} 
            onChange={(e) => onSettingChange('housingLocation', e.target.value)}
          >
            <option value="center">市中心</option>
            <option value="suburb">郊区</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="housingSize" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">住房大小</label>
          <select 
            id="housingSize" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.housingSize} 
            onChange={(e) => onSettingChange('housingSize', e.target.value)}
          >
            {settings.housingType === 'rent' ? (
              <>
                <option value="shared">合租</option>
                <option value="small">小户型（一居室/60㎡）</option>
                <option value="large">大户型（三居室/120㎡）</option>
              </>
            ) : (
              <>
                <option value="small">小户型（一居室/60㎡）</option>
                <option value="large">大户型（三居室/120㎡）</option>
              </>
            )}
          </select>
          {settings.housingType === 'rent' && settings.housingSize === 'shared' && (
            <div className="text-xs text-gray-500 mt-1">
              合租价格约为同地区一居室的60%
            </div>
          )}
        </div>
      </div>
      
      {/* 购房特有设置 */}
      {settings.housingType === 'buy' && (
        <div className="mt-3 md:mt-5 p-3 md:p-4 rounded-lg bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-200 dark:border-blue-700">
          <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mb-2 md:mb-3 font-medium">购房贷款选项</p>
          <div className="flex flex-col space-y-3 md:space-y-4">
            <div className="flex flex-col">
              <label htmlFor="loanInterestRate" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">贷款年利率 (%)</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  id="loanInterestRate" 
                  min="3.0" 
                  max="7.0" 
                  step="0.1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  value={settings.loanInterestRate * 100} 
                  onChange={(e) => onSettingChange('loanInterestRate', Number(e.target.value) / 100)}
                />
                <span className="ml-2 text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[45px] text-right">{(settings.loanInterestRate * 100).toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                注：公积金大于5%时，将自动计算组合贷款利率优惠
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="loanTerm" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">贷款期限 (年)</label>
              <select 
                id="loanTerm" 
                className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={settings.loanTerm} 
                onChange={(e) => onSettingChange('loanTerm', Number(e.target.value))}
              >
                <option value="10">10年</option>
                <option value="15">15年</option>
                <option value="20">20年</option>
                <option value="25">25年</option>
                <option value="30">30年</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 日常生活标签内容
  const renderDailyTab = () => (
    <div className="mt-4">
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="flex flex-col">
          <label htmlFor="companyMeals" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">公司提供餐食</label>
          <select 
            id="companyMeals" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.companyMeals ? 'true' : 'false'} 
            onChange={(e) => onSettingChange('companyMeals', e.target.value === 'true')}
          >
            <option value="true">是（仅计算非工作日餐食）</option>
            <option value="false">否（完全自理餐食）</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="diningHomeRatio" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {settings.companyMeals ? '非工作日在家吃饭比例' : '在家吃饭比例'}
          </label>
          <div className="flex items-center mt-1">
            <input 
              type="range" 
              id="diningHomeRatio" 
              min="0" 
              max="100" 
              step="10"
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              value={settings.diningHomeRatio} 
              onChange={(e) => onSettingChange('diningHomeRatio', Number(e.target.value))}
            />
            <span className="ml-2 text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-[40px] text-right">{settings.diningHomeRatio}%</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
            <span>外出就餐</span>
            <span>在家用餐</span>
          </div>
          {settings.companyMeals && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              注：工作日公司提供餐食，不计入餐饮支出
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="transportType" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">交通方式</label>
          <select 
            id="transportType" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.transportType} 
            onChange={(e) => onSettingChange('transportType', e.target.value)}
          >
            <option value="public">公共交通</option>
            <option value="car">私家车</option>
            <option value="ebike">电动车</option>
            <option value="bike">自行车</option>
            <option value="walk">步行</option>
          </select>
          {(settings.transportType === 'ebike' || settings.transportType === 'bike' || settings.transportType === 'walk') && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              注：该交通方式在各城市费用相同
            </div>
          )}
          
          {/* 私家车贷款选项 */}
          {settings.transportType === 'car' && (
            <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <label htmlFor="carLoanMonthlyPayment" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">每月车贷 (元)</label>
                <input 
                  type="number" 
                  id="carLoanMonthlyPayment" 
                  min="0" 
                  step="100"
                  className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={settings.carLoanMonthlyPayment === 0 ? '' : settings.carLoanMonthlyPayment} 
                  onChange={(e) => onSettingChange('carLoanMonthlyPayment', e.target.value === '' ? 0 : Number(e.target.value))}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  注：车贷将添加到各城市的私家车月费用中
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="entertainmentLevel" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">娱乐水平</label>
          <select 
            id="entertainmentLevel" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.entertainmentLevel} 
            onChange={(e) => onSettingChange('entertainmentLevel', e.target.value)}
          >
            <option value="poor">极简生活</option>
            <option value="low">基本娱乐</option>
            <option value="medium">中等娱乐</option>
            <option value="high">丰富娱乐</option>
          </select>
        </div>
      </div>
    </div>
  );

  // 子女教育标签内容
  const renderEducationTab = () => (
    <div className="mt-4">
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div className="flex flex-col">
          <label htmlFor="childrenCount" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">子女数量</label>
          <select 
            id="childrenCount" 
            className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={settings.childrenCount} 
            onChange={(e) => onSettingChange('childrenCount', Number(e.target.value))}
          >
            <option value="0">无</option>
            <option value="1">1个</option>
            <option value="2">2个</option>
            <option value="3">3个</option>
          </select>
        </div>

        {/* 根据子女数量动态显示教育阶段选择器 */}
        {Array.from({ length: settings.childrenCount }).map((_, index) => (
          <div className="flex flex-col" key={`education-${index}`}>
            <label htmlFor={`educationType-${index}`} className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              子女{index + 1}教育阶段
            </label>
            <select 
              id={`educationType-${index}`} 
              className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={settings.educationTypes[index] || 'kindergarten'} 
              onChange={(e) => handleEducationTypeChange(index, e.target.value)}
            >
              <option value="kindergarten">幼儿园</option>
              <option value="primary">小学</option>
              <option value="middle">初中</option>
              <option value="high">高中</option>
              <option value="international">国际学校</option>
            </select>
          </div>
        ))}
        
        {/* 当没有子女时显示提示 */}
        {settings.childrenCount === 0 && (
          <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400 italic">
            未设置子女，教育支出将为零
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="lifestyle-settings p-3 md:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-5 pb-2 border-b border-gray-100 dark:border-gray-700">生活方式设置</h3>
      
      {isMobile ? (
        // 移动端显示标签栏
        <>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button 
              className={`py-2 px-4 text-xs font-medium transition-colors duration-200 border-b-2 flex items-center ${
                activeTab === 'housing' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('housing')}
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              住房设置
            </button>
            
            <button 
              className={`py-2 px-4 text-xs font-medium transition-colors duration-200 border-b-2 flex items-center ${
                activeTab === 'daily' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('daily')}
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
              日常生活
            </button>
            
            <button 
              className={`py-2 px-4 text-xs font-medium transition-colors duration-200 border-b-2 flex items-center ${
                activeTab === 'education' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('education')}
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              </svg>
              子女教育
            </button>
          </div>
          
          {/* 移动端标签内容 */}
          {activeTab === 'housing' && renderHousingTab()}
          {activeTab === 'daily' && renderDailyTab()}
          {activeTab === 'education' && renderEducationTab()}
        </>
      ) : (
        // 宽屏设备显示全部内容 - 水平布局
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              住房设置
            </h4>
            {renderHousingTab()}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
              日常生活
            </h4>
            {renderDailyTab()}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
              </svg>
              子女教育
            </h4>
            {renderEducationTab()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestyleSettings; 