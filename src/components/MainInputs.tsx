import React, { useState, useEffect } from 'react';
import { Settings } from '../utils/CostCalculator';

interface MainInputsProps {
  settings: Settings;
  availableCities: string[];
  onSettingChange: (key: keyof Settings, value: unknown) => void;
}

const MainInputs: React.FC<MainInputsProps> = ({ settings, availableCities, onSettingChange }) => {
  const [salaryInput, setSalaryInput] = useState(settings.salary.toString());
  const [housingFundInput, setHousingFundInput] = useState((parseFloat(settings.housingFundRate) * 100).toString());

  // 当settings.salary从外部变化时，更新salaryInput
  useEffect(() => {
    // 只在组件挂载时或settings.salary变化时执行
    // 避免在输入为空时将其设置为"0"
    if (settings.salary > 0) {
      setSalaryInput(settings.salary.toString());
    }
  }, [settings.salary]);

  // 当settings.housingFundRate从外部变化时，更新housingFundInput
  useEffect(() => {
    setHousingFundInput((parseFloat(settings.housingFundRate) * 100).toString());
  }, [settings.housingFundRate]);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSalaryInput(value);
    
    // 只有当输入不为空时，才将其转换为数字并更新全局状态
    if (value !== '') {
      onSettingChange('salary', Number(value));
    } else {
      // 当输入为空时，保持输入框为空，但设置salary为0
      onSettingChange('salary', 0);
    }
  };

  const handleHousingFundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHousingFundInput(value);
    
    if (value !== '') {
      // 将百分比转换为小数，例如 8% -> 0.08
      const percent = Number(value);
      if (percent >= 5 && percent <= 12) {
        onSettingChange('housingFundRate', (percent / 100).toString());
      }
    }
  };

  return (
    <div className="main-inputs grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex flex-col">
        <label htmlFor="sourceCity" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">选择基准城市</label>
        <select 
          id="sourceCity" 
          className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={settings.sourceCity} 
          onChange={(e) => onSettingChange('sourceCity', e.target.value)}
        >
          {availableCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="salary" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">税前年收入（元）</label>
        <input 
          type="number" 
          id="salary" 
          placeholder="请输入年收入" 
          min="0" 
          step="1000" 
          className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={salaryInput} 
          onChange={handleSalaryChange}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="housingFundRate" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">公积金比例（%）</label>
        <input
          type="number"
          id="housingFundRate"
          placeholder="公积金比例"
          min="5"
          max="12"
          step="0.1"
          className="border border-gray-300 dark:border-gray-600 rounded-md py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={housingFundInput}
          onChange={handleHousingFundChange}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          允许范围: 5% - 12%
        </div>
      </div>
    </div>
  );
};

export default MainInputs; 