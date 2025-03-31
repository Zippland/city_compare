import React, { useState, useEffect, useMemo } from 'react';
import { Settings, MonthlyIncome, MonthlyCosts } from '../utils/CostCalculator';
import IncomeExpenseDetails from './IncomeExpenseDetails';

interface CityComparisonProps {
  settings: Settings;
  availableCities: string[];
  calculateRequiredSalary: (targetCity: string) => number;
  getCityIncomeAndCosts?: (targetCity: string, targetSalary: number) => { income: MonthlyIncome; costs: MonthlyCosts } | null;
}

interface CityResult {
  cityName: string;
  requiredSalary: number;
  salaryRatio: number;
  expanded?: boolean;
}

const CityComparison: React.FC<CityComparisonProps> = ({ 
  settings, 
  availableCities, 
  calculateRequiredSalary,
  getCityIncomeAndCosts: propGetCityIncomeAndCosts
}) => {
  const [results, setResults] = useState<CityResult[]>([]);
  const [sortBy, setSortBy] = useState<'salary' | 'ratio'>('salary');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  useEffect(() => {
    if (settings.sourceCity && settings.salary > 0) {
      const cityResults = availableCities
        .filter(city => city !== settings.sourceCity)
        .map(city => {
          const requiredSalary = calculateRequiredSalary(city);
          return {
            cityName: city,
            requiredSalary,
            salaryRatio: requiredSalary / settings.salary,
            expanded: false
          };
        });

      setResults(cityResults);
      // 如果之前展开的城市不在结果列表中，重置expandedCity
      if (expandedCity && !cityResults.some(r => r.cityName === expandedCity)) {
        setExpandedCity(null);
      }
    }
  }, [settings.sourceCity, settings.salary, availableCities, calculateRequiredSalary, expandedCity]);

  const handleSort = (field: 'salary' | 'ratio') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const fieldA = sortBy === 'salary' ? a.requiredSalary : a.salaryRatio;
    const fieldB = sortBy === 'salary' ? b.requiredSalary : b.salaryRatio;
    
    return sortDirection === 'asc' 
      ? fieldA - fieldB 
      : fieldB - fieldA;
  });

  // 计算最大变化率，用于进度条显示
  const maxRatio = useMemo(() => {
    if (results.length === 0) return 1;
    return Math.max(...results.map(r => r.salaryRatio));
  }, [results]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 }).format(value);
  };

  const toggleCityDetails = (cityName: string) => {
    setExpandedCity(expandedCity === cityName ? null : cityName);
  };

  // 为选定的城市计算收入和支出数据
  const getCityIncomeAndCosts = (cityName: string): { income: MonthlyIncome; costs: MonthlyCosts } | null => {
    if (!cityName) return null;

    try {
      // 查找城市的结果数据
      const cityResult = results.find(r => r.cityName === cityName);
      if (!cityResult) return null;

      // 如果父组件提供了获取函数，则使用它
      if (propGetCityIncomeAndCosts) {
        return propGetCityIncomeAndCosts(cityName, cityResult.requiredSalary);
      }

      // 否则使用简化的估算方法（作为后备方案）
      // 假设一年12个月
      const monthlySalary = cityResult.requiredSalary / 12;
      
      // 计算月收入细节
      const income: MonthlyIncome = {
        税前工资: monthlySalary,
        社保公积金: monthlySalary * 0.22, // 简化的计算，实际应根据城市政策调整
        个人所得税: monthlySalary * 0.1, // 简化的税收计算
        税后工资: monthlySalary * 0.68 // 简化的税后计算
      };
      
      // 估算月支出细节 (简化的计算，实际应基于具体数据)
      const costs: MonthlyCosts = {
        住房: monthlySalary * 0.3,
        餐饮: monthlySalary * 0.15,
        交通: monthlySalary * 0.1,
        教育: monthlySalary * 0.05,
        日常开销: monthlySalary * 0.1,
        总支出: monthlySalary * 0.7
      };
      
      return { income, costs };
    } catch (err) {
      console.error('Error calculating city income and costs:', err);
      return null;
    }
  };

  // 获取展开城市的详细信息
  const expandedCityDetails = useMemo(() => {
    if (!expandedCity) return null;
    return getCityIncomeAndCosts(expandedCity);
  }, [expandedCity, results, getCityIncomeAndCosts]);

  return (
    <div className="city-comparison p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">同样生活条件在其他城市的所需薪资</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm md:text-base">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-1.5"></div>
                  <span>城市</span>
                </div>
              </th>
              <th 
                scope="col" 
                className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('salary')}
              >
                <div className="flex items-center">
                  <span className="whitespace-nowrap">所需薪资</span>
                  {sortBy === 'salary' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('ratio')}
              >
                <div className="flex items-center">
                  <span className="whitespace-nowrap">倍率</span>
                  {sortBy === 'ratio' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedResults.map((result) => (
              <React.Fragment key={result.cityName}>
                <tr 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    expandedCity === result.cityName ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                  onClick={() => toggleCityDetails(result.cityName)}
                >
                  <td className="px-2 md:px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mr-1.5 transition-all duration-200 ${
                      expandedCity === result.cityName 
                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      <svg 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          expandedCity === result.cityName ? 'rotate-180' : 'rotate-0'
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                    {result.cityName}
                  </td>
                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(result.requiredSalary)}
                  </td>
                  <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <span className={`font-medium ${result.salaryRatio > 1 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'}`}>
                        {result.salaryRatio.toFixed(2)}
                      </span>
                      <div className="ml-1 md:ml-2 w-12 md:w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 md:h-2">
                        <div 
                          className={`h-full rounded-full ${result.salaryRatio > 1 
                            ? 'bg-red-600 dark:bg-red-500' 
                            : 'bg-green-600 dark:bg-green-500'}`}
                          style={{ width: `${(result.salaryRatio / maxRatio) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedCity === result.cityName && expandedCityDetails && (
                  <tr>
                    <td colSpan={3} className="p-2 md:p-4 bg-gray-50 dark:bg-gray-900">
                      <div className="animate-fadeIn">
                        <IncomeExpenseDetails 
                          cityName={result.cityName}
                          income={expandedCityDetails.income}
                          costs={expandedCityDetails.costs}
                          hideTitle={true}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
        <p>* 倍率大于1表示目标城市生活成本更高，小于1表示更低</p>
        <p>* 点击城市行可查看详细数据</p>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CityComparison; 