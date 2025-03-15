// 费用计算器
import CityDataLoader, { CityData } from './CityDataLoader';

export interface Settings {
  sourceCity: string;
  salary: number;
  housingFundRate: string;
  housingType: string;
  housingLocation: string;
  housingSize: string;
  companyMeals: boolean; // 公司是否提供餐食
  diningHomeRatio: number;
  transportType: string;
  carLoanMonthlyPayment: number; // 私家车每月贷款还款金额
  childrenCount: number;
  educationTypes: string[];
  entertainmentLevel: string;
  loanInterestRate: number; // 贷款年利率，默认5.88%
  loanTerm: number; // 贷款期限（年），默认30年
}

export interface MonthlyIncome {
  税前工资: number;
  社保公积金: number;
  个人所得税: number;
  税后工资: number;
}

export interface MonthlyCosts {
  住房: number;
  餐饮: number;
  交通: number;
  教育: number;
  日常开销: number;
  总支出: number;
}

class CostCalculator {
  private cityDataLoader: CityDataLoader;

  constructor(cityDataLoader: CityDataLoader) {
    this.cityDataLoader = cityDataLoader;
  }

  // 计算月度总支出
  calculateMonthlyCosts(cityData: CityData, settings: Settings): MonthlyCosts {
    const housing = this.calculateHousingCost(cityData, settings);
    const dining = this.calculateDiningCost(cityData, settings);
    const transport = this.calculateTransportCost(cityData, settings);
    const education = this.calculateEducationCost(cityData, settings);
    const utilities = this.calculateUtilitiesCost(cityData, settings);

    return {
      住房: Math.round(housing),
      餐饮: Math.round(dining),
      交通: Math.round(transport),
      教育: Math.round(education),
      日常开销: Math.round(utilities),
      总支出: Math.round(housing + dining + transport + education + utilities)
    };
  }

  // 计算月收入情况
  calculateMonthlyIncome(salary: number, cityData: CityData, settings: Settings): MonthlyIncome {
    const monthSalary = salary / 12;
    const insuranceBase = Math.min(
      Math.max(monthSalary, cityData.social_security_base_min),
      cityData.social_security_base_max
    );

    const insurance = {
      养老保险: insuranceBase * 0.08,
      医疗保险: insuranceBase * 0.02,
      失业保险: insuranceBase * 0.005,
      住房公积金: insuranceBase * parseFloat(settings.housingFundRate)
    };

    const monthlyInsurance = Object.values(insurance).reduce((a, b) => a + b, 0);
    const taxable = monthSalary - monthlyInsurance - 5000;
    const tax = this.calculateTax(Math.max(0, taxable));

    return {
      税前工资: Math.round(monthSalary),
      社保公积金: Math.round(monthlyInsurance),
      个人所得税: Math.round(tax),
      税后工资: Math.round(monthSalary - monthlyInsurance - tax)
    };
  }

  // 计算住房成本
  private calculateHousingCost(cityData: CityData, settings: Settings): number {
    if (settings.housingType === 'rent') {
      // 租房
      if (settings.housingLocation === 'center') {
        // 市中心
        if (settings.housingSize === 'shared') {
          // 合租（一居室的60%）
          return cityData.rent_center_1b * 0.6;
        } else if (settings.housingSize === 'small') {
          // 一居室
          return cityData.rent_center_1b;
        } else {
          // 三居室
          return cityData.rent_center_3b;
        }
      } else {
        // 郊区
        if (settings.housingSize === 'shared') {
          // 合租（一居室的60%）
          return cityData.rent_suburb_1b * 0.6;
        } else if (settings.housingSize === 'small') {
          // 一居室
          return cityData.rent_suburb_1b;
        } else {
          // 三居室
          return cityData.rent_suburb_3b;
        }
      }
    } else {
      // 购房
      let housePrice;
      if (settings.housingLocation === 'center') {
        // 市中心
        housePrice = cityData.house_price_center;
      } else {
        // 郊区
        housePrice = cityData.house_price_suburb;
      }
      
      let area;
      if (settings.housingSize === 'small') {
        // 小户型 (60平方米)
        area = 60;
      } else {
        // 大户型 (120平方米)
        area = 120;
      }
      
      const totalPrice = housePrice * area;
      const downPayment = totalPrice * 0.3; // 假设首付30%
      const loan = totalPrice - downPayment;
      
      // 优化1：使用用户设置的贷款利率和期限
      const years = settings.loanTerm || 30; // 默认30年
      const months = years * 12;
      
      // 优化2：考虑公积金贷款的影响
      const useHousingFund = parseFloat(settings.housingFundRate) > 0.05; // 公积金比例大于5%才考虑
      const baseRate = settings.loanInterestRate || 0.0588; // 默认5.88%
      
      // 根据公积金使用情况调整有效利率
      const effectiveRate = useHousingFund 
        ? baseRate * 0.7 + 0.0325 * 0.3 // 假设70%商贷+30%公积金
        : baseRate; // 纯商贷
      
      const monthlyRate = effectiveRate / 12;
      
      // 等额本息还款公式
      const monthlyPayment = loan * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
      
      // 优化3：添加物业费
      const propertyFee = settings.housingSize === 'small' 
        ? 180 // 小户型月物业费
        : 360; // 大户型月物业费
      
      return monthlyPayment + propertyFee;
    }
  }

  // 计算餐饮成本
  private calculateDiningCost(cityData: CityData, settings: Settings): number {
    // 如果公司提供餐食，只考虑非工作日的用餐成本
    // 假设一个月22个工作日，8个非工作日
    if (settings.companyMeals) {
      // 非工作日占总天数的比例约为 8/30 ≈ 0.27
      const nonWorkdayRatio = 0.27;
      
      // 在非工作日，按照用户设置的在家用餐比例计算
      const diningHomeRatio = settings.diningHomeRatio / 100;
      const diningOutRatio = 1 - diningHomeRatio;
      
      // 非工作日的餐饮成本
      const nonWorkdayCost = cityData.dining_home * diningHomeRatio + cityData.dining_out * diningOutRatio;
      
      // 总餐饮成本为非工作日的成本
      return nonWorkdayCost * nonWorkdayRatio; // 只考虑非工作日比例，不乘以30天
    } else {
      // 公司不提供餐食，按照原逻辑计算
      const diningHomeRatio = settings.diningHomeRatio / 100;
      const diningOutRatio = 1 - diningHomeRatio;
      
      return cityData.dining_home * diningHomeRatio + cityData.dining_out * diningOutRatio;
    }
  }

  // 计算交通成本
  private calculateTransportCost(cityData: CityData, settings: Settings): number {
    switch(settings.transportType) {
      case 'public':
        return cityData.transport_public;
      case 'car':
        // 私家车费用加上每月车贷
        return cityData.transport_car + (settings.carLoanMonthlyPayment || 0);
      case 'ebike':
        return 100; // 电动车固定费用：电池、充电、维修等
      case 'bike':
        return 0;   // 自行车固定费用
      case 'walk':
        return 0;   // 步行固定费用
      default:
        return cityData.transport_public; // 默认使用公共交通
    }
  }

  // 计算教育成本
  private calculateEducationCost(cityData: CityData, settings: Settings): number {
    let educationCost = 0;
    
    if (settings.childrenCount > 0) {
      settings.educationTypes.forEach(educationType => {
        switch(educationType) {
          case 'kindergarten':
            educationCost += cityData.kindergarten;
            break;
          case 'primary':
            educationCost += cityData.primary;
            break;
          case 'middle':
            educationCost += cityData.middle;
            break;
          case 'high':
            educationCost += cityData.high;
            break;
          case 'international':
            educationCost += cityData.international;
            break;
          default:
            break;
        }
      });
    }
    
    return educationCost;
  }

  // 计算日常生活支出
  private calculateUtilitiesCost(cityData: CityData, settings: Settings): number {
    let entertainmentCost = 0;
    switch(settings.entertainmentLevel) {
      case 'poor': 
        entertainmentCost = 0;
        break;
      case 'low': 
        entertainmentCost = (cityData.fitness + cityData.cinema) * 2;
        break;
      case 'medium':
        entertainmentCost = (cityData.fitness + cityData.cinema) * 4;
        break;
      case 'high':
        entertainmentCost = (cityData.fitness + cityData.cinema) * 8;
        break;
      default:
        break;
    }
    return cityData.utilities + cityData.mobile_plan + cityData.internet + entertainmentCost;
  }

  private calculateTax(monthlyTaxable: number): number {
    const brackets = [
      { limit: 0, rate: 0.03, deduction: 0 },
      { limit: 3000, rate: 0.1, deduction: 210 },
      { limit: 12000, rate: 0.2, deduction: 1410 },
      { limit: 25000, rate: 0.25, deduction: 2660 },
      { limit: 35000, rate: 0.3, deduction: 4410 },
      { limit: 55000, rate: 0.35, deduction: 7160 },
      { limit: 80000, rate: 0.45, deduction: 15160 }
    ];

    for (let i = brackets.length - 1; i >= 0; i--) {
      if (monthlyTaxable > brackets[i].limit) {
        return monthlyTaxable * brackets[i].rate - brackets[i].deduction;
      }
    }
    return 0;
  }

  // 反推目标城市所需工资
  calculateRequiredSalary(sourceCityName: string, targetCityName: string, sourceSalary: number, settings: Settings): number {
    const sourceCityData = this.cityDataLoader.getCityData(sourceCityName);
    const targetCityData = this.cityDataLoader.getCityData(targetCityName);
    
    if (!sourceCityData || !targetCityData) {
      throw new Error('城市数据未找到');
    }

    // 1. 计算源城市的每月结余
    const sourceIncome = this.calculateMonthlyIncome(sourceSalary, sourceCityData, settings);
    const sourceCosts = this.calculateMonthlyCosts(sourceCityData, settings);
    const targetSavingsGoal = sourceIncome.税后工资 - sourceCosts.总支出;

    // 2. 计算目标城市的总支出
    const targetCosts = this.calculateMonthlyCosts(targetCityData, settings);
    
    // 3. 计算目标城市需要的税后月工资
    const targetAfterTaxMonthly = targetCosts.总支出 + targetSavingsGoal;
    
    // 4. 反推需要的税前年工资
    // 从一个初始工资开始，每次增加或减少1000元进行逼近
    let targetAnnualSalary = sourceSalary; // 从源工资开始尝试
    let lastDiff = Infinity;
    let step = 10000; // 初始步长
    
    for (let i = 0; i < 100; i++) { // 限制迭代次数，避免无限循环
      const monthlyIncome = this.calculateMonthlyIncome(targetAnnualSalary, targetCityData, settings);
      const diff = monthlyIncome.税后工资 - targetAfterTaxMonthly;
      
      // 如果差异小于100元，认为足够接近了
      if (Math.abs(diff) < 100) {
        break;
      }
      
      // 根据差异调整工资
      if (diff < 0) {
        // 税后工资不够，需要增加税前工资
        targetAnnualSalary += step;
      } else {
        // 税后工资过多，需要减少税前工资
        targetAnnualSalary -= step;
      }
      
      // 如果方向改变了，减小步长
      if ((diff > 0 && lastDiff < 0) || (diff < 0 && lastDiff > 0)) {
        step = Math.max(1000, step / 2);
      }
      
      lastDiff = diff;
    }
    
    return targetAnnualSalary;
  }
}

export default CostCalculator; 