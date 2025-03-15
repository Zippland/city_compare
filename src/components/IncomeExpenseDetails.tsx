import React from 'react';
import { MonthlyIncome, MonthlyCosts } from '../utils/CostCalculator';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ScriptableContext } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IncomeExpenseDetailsProps {
  cityName: string;
  income: MonthlyIncome;
  costs: MonthlyCosts;
}

const IncomeExpenseDetails: React.FC<IncomeExpenseDetailsProps> = ({ cityName, income, costs }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value);
  };

  // 自定义渐变色
  const incomeGradients = [
    ['#36a2eb', '#1a7fbd'], // 蓝色渐变 - 税后工资
    ['#ff6384', '#e63c5e'], // 红色渐变 - 个税
    ['#ffcd56', '#f0b400']  // 黄色渐变 - 社保公积金
  ];

  const expenseGradients = [
    ['#ff6384', '#e63c5e'], // 红色渐变 - 住房
    ['#36a2eb', '#1a7fbd'], // 蓝色渐变 - 餐饮
    ['#ffcd56', '#f0b400'], // 黄色渐变 - 交通
    ['#4bc0c0', '#2b9797'], // 青色渐变 - 教育
    ['#9966ff', '#7a47d1']  // 紫色渐变 - 日常开销
  ];

  // 用纯色代替渐变色，解决类型问题
  const incomeColors = ['#36a2eb', '#ff6384', '#ffcd56'];
  const expenseColors = ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'];

  const incomeData: ChartData<'doughnut', number[], string> = {
    labels: ['税后工资', '个人所得税', '社保公积金'],
    datasets: [
      {
        data: [income.税后工资, income.个人所得税, income.社保公积金],
        backgroundColor: incomeColors,
        borderColor: incomeColors,
        borderWidth: 2,
        borderRadius: 4,
        hoverOffset: 15, 
        spacing: 5,
      },
    ],
  };

  const expenseData: ChartData<'doughnut', number[], string> = {
    labels: ['住房', '餐饮', '交通', '教育', '日常开销'],
    datasets: [
      {
        data: [costs.住房, costs.餐饮, costs.交通, costs.教育, costs.日常开销],
        backgroundColor: expenseColors,
        borderColor: expenseColors,
        borderWidth: 2,
        borderRadius: 4,
        hoverOffset: 15,
        spacing: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: 11,
            family: 'system-ui'
          },
          padding: 15,
          color: '#555',
        }
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return ` ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true
    }
  };

  const monthlySavings = income.税后工资 - costs.总支出;
  const savingsRate = (monthlySavings / income.税后工资) * 100;

  // 计算收入与支出的百分比
  const calculatePercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="income-expense-details p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-5 pb-2 border-b border-gray-100 dark:border-gray-700 flex items-center">
        <span className="mr-2 text-blue-500 dark:text-blue-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
          </svg>
        </span>
        {cityName} 月度收支详情
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="income-section p-5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-100 dark:border-blue-800">
          <h4 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
            </svg>
            月收入
          </h4>
          <div className="flex items-center justify-center">
            <div className="chart-container relative" style={{ height: '250px', width: '250px' }}>
              <Doughnut data={incomeData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'translateY(-30px)' }}>
                <div className="text-xs text-gray-500 dark:text-gray-400">税前工资</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(income.税前工资)}</div>
          </div>
            </div>
          </div>
          <div className="mt-6 space-y-2.5 text-sm">
            <div className="flex justify-between items-center p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: incomeColors[0]}}></span>
                <span className="text-gray-700 dark:text-gray-300">税后工资：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(income.税后工资)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(income.税后工资, income.税前工资)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: incomeColors[1]}}></span>
                <span className="text-gray-700 dark:text-gray-300">个人所得税：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(income.个人所得税)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(income.个人所得税, income.税前工资)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: incomeColors[2]}}></span>
                <span className="text-gray-700 dark:text-gray-300">社保公积金：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-yellow-600 dark:text-yellow-400">-{formatCurrency(income.社保公积金)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(income.社保公积金, income.税前工资)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="expense-section p-5 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border border-red-100 dark:border-red-800">
          <h4 className="text-lg font-medium text-red-700 dark:text-red-300 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"></path>
              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
            </svg>
            月支出
          </h4>
          <div className="flex items-center justify-center">
            <div className="chart-container relative" style={{ height: '250px', width: '250px' }}>
              <Doughnut data={expenseData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'translateY(-30px)' }}>
                <div className="text-xs text-gray-500 dark:text-gray-400">总支出</div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(costs.总支出)}</div>
          </div>
            </div>
          </div>
          <div className="mt-6 space-y-2.5 text-sm">
            <div className="flex justify-between items-center p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: expenseColors[0]}}></span>
                <span className="text-gray-700 dark:text-gray-300">住房：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(costs.住房)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(costs.住房, costs.总支出)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-blue-50 dark:hover:bg-blue-800 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: expenseColors[1]}}></span>
                <span className="text-gray-700 dark:text-gray-300">餐饮：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-blue-600 dark:text-blue-400">-{formatCurrency(costs.餐饮)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(costs.餐饮, costs.总支出)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: expenseColors[2]}}></span>
                <span className="text-gray-700 dark:text-gray-300">交通：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-yellow-600 dark:text-yellow-400">-{formatCurrency(costs.交通)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(costs.交通, costs.总支出)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-teal-50 dark:hover:bg-teal-900 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: expenseColors[3]}}></span>
                <span className="text-gray-700 dark:text-gray-300">教育：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-teal-600 dark:text-teal-400">-{formatCurrency(costs.教育)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(costs.教育, costs.总支出)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{backgroundColor: expenseColors[4]}}></span>
                <span className="text-gray-700 dark:text-gray-300">日常开销：</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-purple-600 dark:text-purple-400">-{formatCurrency(costs.日常开销)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{calculatePercentage(costs.日常开销, costs.总支出)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="savings-section mt-8 p-5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-100 dark:border-green-800 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-medium text-green-800 dark:text-green-300 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
              </svg>
              月结余
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6">税后工资 - 总支出</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${monthlySavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(monthlySavings)}
            </div>
            <div className="text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">结余率: </span>
              <span className={`font-medium ${savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {savingsRate.toFixed(1)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                ({savingsRate >= 20 ? '良好' : savingsRate >= 10 ? '一般' : '需改善'})
              </span>
            </div>
          </div>
        </div>
        
        {/* 结余指示器 */}
        <div className="mt-4 pt-2">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full ${
                savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(savingsRate, 40)) * 2.5}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>10%</span>
            <span>20%</span>
            <span>30%</span>
            <span>40%+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseDetails; 