import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface WorkdayConfig extends ConnectionConfig {
  tenant: string
  username: string
  password: string
  endpoint: string
}

export class WorkdayConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'workday'
  public readonly name = 'Workday'
  public readonly description = 'Enterprise HR platform with workforce management, payroll, and talent management'
  public readonly category = 'hr'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'tenant',
        label: 'Tenant',
        type: 'text' as const,
        required: true,
        description: 'Workday tenant name'
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text' as const,
        required: true,
        description: 'Workday integration system user username'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password' as const,
        required: true,
        description: 'Workday integration system user password'
      },
      {
        key: 'endpoint',
        label: 'Endpoint',
        type: 'text' as const,
        required: true,
        description: 'Workday web services endpoint URL'
      }
    ]
  }

  async validateConnection(config: WorkdayConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const auth = Buffer.from(`${config.username}@${config.tenant}:${config.password}`).toString('base64')
      
      // Test connection with a simple get workers request
      const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
          <soapenv:Header/>
          <soapenv:Body>
            <wd:Get_Workers_Request wd:version="v35.0">
              <wd:Request_Criteria>
                <wd:Exclude_Inactive_Workers>true</wd:Exclude_Inactive_Workers>
                <wd:Exclude_Terminated_Workers>true</wd:Exclude_Terminated_Workers>
              </wd:Request_Criteria>
              <wd:Response_Filter>
                <wd:Page>1</wd:Page>
                <wd:Count>1</wd:Count>
              </wd:Response_Filter>
            </wd:Get_Workers_Request>
          </soapenv:Body>
        </soapenv:Envelope>
      `

      const response = await fetch(`${config.endpoint}/ccx/service/${config.tenant}/Human_Resources/v35.0`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': ''
        },
        body: soapEnvelope
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid Workday credentials or endpoint' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: WorkdayConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const auth = Buffer.from(`${config.username}@${config.tenant}:${config.password}`).toString('base64')

      let result
      switch (operation) {
        case 'getWorkers':
          result = await this.getWorkers(params, config, auth)
          break
        case 'getWorker':
          result = await this.getWorker(params, config, auth)
          break
        case 'createWorker':
          result = await this.createWorker(params, config, auth)
          break
        case 'updateWorker':
          result = await this.updateWorker(params, config, auth)
          break
        case 'terminateWorker':
          result = await this.terminateWorker(params, config, auth)
          break
        case 'getOrganizations':
          result = await this.getOrganizations(params, config, auth)
          break
        case 'getJobs':
          result = await this.getJobs(params, config, auth)
          break
        case 'getTimeOffEvents':
          result = await this.getTimeOffEvents(params, config, auth)
          break
        case 'submitTimeOffRequest':
          result = await this.submitTimeOffRequest(params, config, auth)
          break
        case 'getPayrollResults':
          result = await this.getPayrollResults(params, config, auth)
          break
        case 'getCompensation':
          result = await this.getCompensation(params, config, auth)
          break
        case 'getPerformanceReviews':
          result = await this.getPerformanceReviews(params, config, auth)
          break
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }

      return {
        success: true,
        data: result,
        operation: operation,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async makeSoapRequest(soapEnvelope: string, service: string, config: WorkdayConfig, auth: string): Promise<any> {
    const response = await fetch(`${config.endpoint}/ccx/service/${config.tenant}/${service}/v35.0`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': ''
      },
      body: soapEnvelope
    })

    const xmlText = await response.text()
    
    if (!response.ok) {
      throw new Error(`Workday API Error: ${response.status} - ${xmlText}`)
    }

    // Simple XML parsing - in production, use a proper XML parser
    return { xmlResponse: xmlText, parsed: this.parseXmlResponse(xmlText) }
  }

  private parseXmlResponse(xml: string): any {
    // Simple XML parsing for demo - use proper XML parser in production
    const entries = []
    const entryRegex = /<wd:Worker[^>]*>(.*?)<\/wd:Worker>/gs
    let match
    
    while ((match = entryRegex.exec(xml)) !== null) {
      entries.push({
        content: match[1],
        // Extract basic worker info
        id: this.extractXmlValue(match[1], 'Worker_ID'),
        name: this.extractXmlValue(match[1], 'Legal_Name')
      })
    }
    
    return { workers: entries }
  }

  private extractXmlValue(xml: string, tagName: string): string {
    const regex = new RegExp(`<wd:${tagName}[^>]*>(.*?)<\/wd:${tagName}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1] : ''
  }

  private async getWorkers(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Workers_Request wd:version="v35.0">
            <wd:Request_Criteria>
              <wd:Exclude_Inactive_Workers>${params.exclude_inactive || true}</wd:Exclude_Inactive_Workers>
              <wd:Exclude_Terminated_Workers>${params.exclude_terminated || true}</wd:Exclude_Terminated_Workers>
              ${params.organization_id ? `<wd:Organization_Reference><wd:ID wd:type="Organization_Reference_ID">${params.organization_id}</wd:ID></wd:Organization_Reference>` : ''}
            </wd:Request_Criteria>
            <wd:Response_Filter>
              <wd:Page>${params.page || 1}</wd:Page>
              <wd:Count>${params.count || 100}</wd:Count>
            </wd:Response_Filter>
            <wd:Response_Group>
              <wd:Include_Reference>true</wd:Include_Reference>
              <wd:Include_Personal_Information>true</wd:Include_Personal_Information>
              <wd:Include_Employment_Information>true</wd:Include_Employment_Information>
              <wd:Include_Compensation>true</wd:Include_Compensation>
              <wd:Include_Organizations>true</wd:Include_Organizations>
            </wd:Response_Group>
          </wd:Get_Workers_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async getWorker(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Workers_Request wd:version="v35.0">
            <wd:Request_References>
              <wd:Worker_Reference>
                <wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID>
              </wd:Worker_Reference>
            </wd:Request_References>
            <wd:Response_Group>
              <wd:Include_Reference>true</wd:Include_Reference>
              <wd:Include_Personal_Information>true</wd:Include_Personal_Information>
              <wd:Include_Employment_Information>true</wd:Include_Employment_Information>
              <wd:Include_Compensation>true</wd:Include_Compensation>
              <wd:Include_Organizations>true</wd:Include_Organizations>
              <wd:Include_Roles>true</wd:Include_Roles>
            </wd:Response_Group>
          </wd:Get_Workers_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async createWorker(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Hire_Employee_Request wd:version="v35.0">
            <wd:Business_Process_Parameters>
              <wd:Auto_Complete>true</wd:Auto_Complete>
              <wd:Run_Now>true</wd:Run_Now>
            </wd:Business_Process_Parameters>
            <wd:Hire_Employee_Data>
              <wd:Applicant_Reference>
                <wd:ID wd:type="External_Applicant_ID">${params.applicant_id}</wd:ID>
              </wd:Applicant_Reference>
              <wd:Hire_Date>${params.hire_date}</wd:Hire_Date>
              <wd:Employee_Type_Reference>
                <wd:ID wd:type="Employee_Type_ID">${params.employee_type}</wd:ID>
              </wd:Employee_Type_Reference>
              <wd:Position_Details>
                <wd:Position_Reference>
                  <wd:ID wd:type="Position_ID">${params.position_id}</wd:ID>
                </wd:Position_Reference>
              </wd:Position_Details>
            </wd:Hire_Employee_Data>
          </wd:Hire_Employee_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async updateWorker(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Change_Personal_Information_Request wd:version="v35.0">
            <wd:Business_Process_Parameters>
              <wd:Auto_Complete>true</wd:Auto_Complete>
              <wd:Run_Now>true</wd:Run_Now>
            </wd:Business_Process_Parameters>
            <wd:Change_Personal_Information_Data>
              <wd:Worker_Reference>
                <wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID>
              </wd:Worker_Reference>
              <wd:Effective_Date>${params.effective_date || new Date().toISOString().split('T')[0]}</wd:Effective_Date>
              <wd:Worker_Data>
                <wd:Personal_Data>
                  ${params.first_name ? `<wd:Name_Data><wd:Legal_Name_Data><wd:Name_Detail_Data><wd:First_Name>${params.first_name}</wd:First_Name></wd:Name_Detail_Data></wd:Legal_Name_Data></wd:Name_Data>` : ''}
                  ${params.last_name ? `<wd:Name_Data><wd:Legal_Name_Data><wd:Name_Detail_Data><wd:Last_Name>${params.last_name}</wd:Last_Name></wd:Name_Detail_Data></wd:Legal_Name_Data></wd:Name_Data>` : ''}
                </wd:Personal_Data>
              </wd:Worker_Data>
            </wd:Change_Personal_Information_Data>
          </wd:Change_Personal_Information_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async terminateWorker(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Terminate_Employee_Request wd:version="v35.0">
            <wd:Business_Process_Parameters>
              <wd:Auto_Complete>true</wd:Auto_Complete>
              <wd:Run_Now>true</wd:Run_Now>
            </wd:Business_Process_Parameters>
            <wd:Terminate_Employee_Data>
              <wd:Employee_Reference>
                <wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID>
              </wd:Employee_Reference>
              <wd:Termination_Date>${params.termination_date}</wd:Termination_Date>
              <wd:Primary_Reason_Reference>
                <wd:ID wd:type="Termination_Reason_ID">${params.reason}</wd:ID>
              </wd:Primary_Reason_Reference>
              ${params.last_day_of_work ? `<wd:Last_Day_of_Work>${params.last_day_of_work}</wd:Last_Day_of_Work>` : ''}
            </wd:Terminate_Employee_Data>
          </wd:Terminate_Employee_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async getOrganizations(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Organizations_Request wd:version="v35.0">
            <wd:Request_Criteria>
              <wd:Organization_Types>
                <wd:Organization_Type_Reference>
                  <wd:ID wd:type="Organization_Type_ID">${params.organization_type || 'COMPANY'}</wd:ID>
                </wd:Organization_Type_Reference>
              </wd:Organization_Types>
            </wd:Request_Criteria>
            <wd:Response_Filter>
              <wd:Page>${params.page || 1}</wd:Page>
              <wd:Count>${params.count || 100}</wd:Count>
            </wd:Response_Filter>
          </wd:Get_Organizations_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async getJobs(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Jobs_Request wd:version="v35.0">
            <wd:Response_Filter>
              <wd:Page>${params.page || 1}</wd:Page>
              <wd:Count>${params.count || 100}</wd:Count>
            </wd:Response_Filter>
            <wd:Response_Group>
              <wd:Include_Reference>true</wd:Include_Reference>
              <wd:Include_Job_Profile_Data>true</wd:Include_Job_Profile_Data>
            </wd:Response_Group>
          </wd:Get_Jobs_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Human_Resources', config, auth)
  }

  private async getTimeOffEvents(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Time_Off_Events_Request wd:version="v35.0">
            <wd:Request_Criteria>
              ${params.worker_id ? `<wd:Worker_Reference><wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID></wd:Worker_Reference>` : ''}
              ${params.from_date ? `<wd:From_Date>${params.from_date}</wd:From_Date>` : ''}
              ${params.to_date ? `<wd:To_Date>${params.to_date}</wd:To_Date>` : ''}
            </wd:Request_Criteria>
            <wd:Response_Filter>
              <wd:Page>${params.page || 1}</wd:Page>
              <wd:Count>${params.count || 100}</wd:Count>
            </wd:Response_Filter>
          </wd:Get_Time_Off_Events_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Absence_Management', config, auth)
  }

  private async submitTimeOffRequest(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Request_Time_Off_Request wd:version="v35.0">
            <wd:Business_Process_Parameters>
              <wd:Auto_Complete>true</wd:Auto_Complete>
              <wd:Run_Now>true</wd:Run_Now>
            </wd:Business_Process_Parameters>
            <wd:Request_Time_Off_Data>
              <wd:Employee_Reference>
                <wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID>
              </wd:Employee_Reference>
              <wd:Time_Off_Type_Reference>
                <wd:ID wd:type="Time_Off_Type_ID">${params.time_off_type}</wd:ID>
              </wd:Time_Off_Type_Reference>
              <wd:Time_Off_Entry>
                <wd:Date>${params.date}</wd:Date>
                <wd:Days_or_Hours>${params.days_or_hours}</wd:Days_or_Hours>
              </wd:Time_Off_Entry>
              ${params.comment ? `<wd:Comment>${params.comment}</wd:Comment>` : ''}
            </wd:Request_Time_Off_Data>
          </wd:Request_Time_Off_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Absence_Management', config, auth)
  }

  private async getPayrollResults(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Payroll_Results_Request wd:version="v35.0">
            <wd:Request_Criteria>
              ${params.worker_id ? `<wd:Worker_Reference><wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID></wd:Worker_Reference>` : ''}
              <wd:Payroll_Result_Period_Reference>
                <wd:ID wd:type="Payroll_Result_Period_ID">${params.period_id}</wd:ID>
              </wd:Payroll_Result_Period_Reference>
            </wd:Request_Criteria>
            <wd:Response_Filter>
              <wd:Page>${params.page || 1}</wd:Page>
              <wd:Count>${params.count || 100}</wd:Count>
            </wd:Response_Filter>
          </wd:Get_Payroll_Results_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Payroll', config, auth)
  }

  private async getCompensation(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Worker_Compensation_Request wd:version="v35.0">
            <wd:Request_References>
              <wd:Worker_Reference>
                <wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID>
              </wd:Worker_Reference>
            </wd:Request_References>
            <wd:Response_Group>
              <wd:Include_Compensation_Elements>true</wd:Include_Compensation_Elements>
              <wd:Include_Salary_and_Hourly_Plans>true</wd:Include_Salary_and_Hourly_Plans>
              <wd:Include_Allowance_Plans>true</wd:Include_Allowance_Plans>
              <wd:Include_Commission_Plans>true</wd:Include_Commission_Plans>
              <wd:Include_Merit_Plans>true</wd:Include_Merit_Plans>
            </wd:Response_Group>
          </wd:Get_Worker_Compensation_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Compensation', config, auth)
  }

  private async getPerformanceReviews(params: any, config: WorkdayConfig, auth: string): Promise<any> {
    const soapEnvelope = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
        <soapenv:Header/>
        <soapenv:Body>
          <wd:Get_Performance_Documents_Request wd:version="v35.0">
            <wd:Request_Criteria>
              ${params.worker_id ? `<wd:Worker_Reference><wd:ID wd:type="Employee_ID">${params.worker_id}</wd:ID></wd:Worker_Reference>` : ''}
              ${params.review_period ? `<wd:Review_Period_Reference><wd:ID wd:type="Review_Period_ID">${params.review_period}</wd:ID></wd:Review_Period_Reference>` : ''}
            </wd:Request_Criteria>
            <wd:Response_Filter>
              <wd:Page>${params.page || 1}</wd:Page>
              <wd:Count>${params.count || 100}</wd:Count>
            </wd:Response_Filter>
          </wd:Get_Performance_Documents_Request>
        </soapenv:Body>
      </soapenv:Envelope>
    `
    
    return await this.makeSoapRequest(soapEnvelope, 'Performance_Management', config, auth)
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 600,
        requestsPerDay: 10000
      },
      hrFeatures: {
        supportsEmployeeManagement: true,
        supportsPayroll: true,
        supportsTimeOff: true,
        supportsPerformanceManagement: true,
        supportsCompensation: true,
        supportsRecruitment: true,
        supportsTalentManagement: true,
        supportsLearning: true,
        supportsAnalytics: true,
        maxEmployees: 'unlimited',
        supportedCountries: 'global',
        complianceStandards: ['SOX', 'GDPR', 'SOC 2', 'ISO 27001']
      }
    }
  }
}