'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MainInputs from '../components/MainInputs';
import LifestyleSettings from '../components/LifestyleSettings';
import IncomeExpenseDetails from '../components/IncomeExpenseDetails';
import CityComparison from '../components/CityComparison';
import CityDataLoader from '../utils/CityDataLoader';
import CostCalculator, { Settings, MonthlyIncome, MonthlyCosts } from '../utils/CostCalculator';

export default function Home() {
  const [cityDataLoader, setCityDataLoader] = useState<CityDataLoader | null>(null);
  const [costCalculator, setCostCalculator] = useState<CostCalculator | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({
    sourceCity: '',
    salary: 240000,
    housingFundRate: '0.08',
    housingType: 'rent',
    housingLocation: 'center',
    housingSize: 'small',
    companyMeals: false, // 默认公司不提供餐食
    diningHomeRatio: 70,
    transportType: 'public',
    carLoanMonthlyPayment: 0, // 默认无车贷
    childrenCount: 0,
    educationTypes: [],
    entertainmentLevel: 'medium',
    loanInterestRate: 0.0588, // 默认5.88%年利率
    loanTerm: 30 // 默认30年贷款期限
  });

  const [sourceIncome, setSourceIncome] = useState<MonthlyIncome | null>(null);
  const [sourceCosts, setSourceCosts] = useState<MonthlyCosts | null>(null);

  // 加载城市数据
  useEffect(() => {
    const loadCityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/city_data.csv');
        const csvText = await response.text();
        
        const loader = new CityDataLoader();
        await loader.loadData(csvText);
        
        const calculator = new CostCalculator(loader);
        
        const cities = loader.getAvailableCities();
        
        setCityDataLoader(loader);
        setCostCalculator(calculator);
        setAvailableCities(cities);
        
        if (cities.length > 0) {
          setSettings(prev => ({
            ...prev,
            sourceCity: cities[0]
          }));
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('加载城市数据失败，请刷新页面重试');
        setIsLoading(false);
        console.error('Error loading city data:', err);
      }
    };
    
    loadCityData();
  }, []);

  // 计算结果
  useEffect(() => {
    if (costCalculator && settings.sourceCity && settings.salary > 0) {
      const cityData = cityDataLoader?.getCityData(settings.sourceCity);
      
      if (cityData) {
        const income = costCalculator.calculateMonthlyIncome(settings.salary, cityData, settings);
        const costs = costCalculator.calculateMonthlyCosts(cityData, settings);
        
        setSourceIncome(income);
        setSourceCosts(costs);
      }
    }
  }, [costCalculator, cityDataLoader, settings]);

  const handleSettingChange = (key: keyof Settings, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const calculateRequiredSalary = (targetCity: string): number => {
    if (!costCalculator) return 0;
    
    try {
      return costCalculator.calculateRequiredSalary(
        settings.sourceCity,
        targetCity,
        settings.salary,
        settings
      );
    } catch (err) {
      console.error('Error calculating required salary:', err);
      return 0;
    }
  };

  // 为指定城市和薪资计算详细的收入和支出数据
  const getCityIncomeAndCosts = (targetCity: string, targetSalary: number): { income: MonthlyIncome; costs: MonthlyCosts } | null => {
    if (!costCalculator || !cityDataLoader) return null;
    
    try {
      const cityData = cityDataLoader.getCityData(targetCity);
      if (!cityData) return null;

      // 创建一个临时设置对象，将目标城市作为源城市，并使用计算出的所需薪资
      const tempSettings: Settings = {
        ...settings,
        sourceCity: targetCity,
        salary: targetSalary
      };

      // 计算基于这些设置的月收入和支出
      const income = costCalculator.calculateMonthlyIncome(targetSalary, cityData, tempSettings);
      const costs = costCalculator.calculateMonthlyCosts(cityData, tempSettings);
      
      return { income, costs };
    } catch (err) {
      console.error('Error calculating city income and costs:', err);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载城市数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <MainInputs 
          settings={settings} 
          availableCities={availableCities} 
          onSettingChange={handleSettingChange} 
        />
        
        <LifestyleSettings 
          settings={settings} 
          onSettingChange={handleSettingChange} 
        />
        
        {sourceIncome && sourceCosts && (
          <IncomeExpenseDetails 
            cityName={settings.sourceCity} 
            income={sourceIncome} 
            costs={sourceCosts} 
          />
        )}
        
        <CityComparison 
          settings={settings} 
          availableCities={availableCities} 
          calculateRequiredSalary={calculateRequiredSalary} 
          getCityIncomeAndCosts={getCityIncomeAndCosts}
        />
      </main>
      
      <footer className="w-full py-5 mt-8 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center gap-8 mb-3">
            <a 
              href="https://worthjob.zippland.com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">Offer打分</span>
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 max-w-[200px] text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  <p>全面考量，计算薪资之外的工作真实价值</p>
                </div>
                <div className="w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-b border-r border-gray-100 dark:border-gray-700 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
              </div>
            </a>
            
            <a 
              href="https://offerselect.zippland.com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">OfferSelect</span>
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 max-w-[200px] text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  <p>一站式求职Offer比较工具，帮助您在多个工作机会之间做出选择</p>
                </div>
                <div className="w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-b border-r border-gray-100 dark:border-gray-700 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
              </div>
            </a>
            
            <a 
              href="https://snapsolver.zippland.com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm transform transition-all duration-200 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs mt-1.5 text-gray-700 dark:text-gray-300 font-medium">AI笔试</span>
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 max-w-[200px] text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                  <p>AI笔试题解答工具，截图上传获取解答</p>
                </div>
                <div className="w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-b border-r border-gray-100 dark:border-gray-700 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
              </div>
            </a>
          </div>
          <div className="text-center">
            <span className="text-[9px] text-gray-400">更多实用工具 by zippland.com</span>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} 城市生活成本对比工具 | 数据仅供参考</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
