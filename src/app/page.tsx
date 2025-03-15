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
      
      <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} 城市生活成本对比工具 | 数据仅供参考</p>
        </div>
      </footer>
    </div>
  );
}
