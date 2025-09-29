// Workflow scheduler for managing timed executions
import { WorkflowDefinition, WorkflowContext } from '../types'
import { workflowExecutor } from './executor'

export interface ScheduledJob {
  id: string
  workflowId: string
  schedule: string // cron expression
  context: WorkflowContext
  enabled: boolean
  nextRun?: Date
  lastRun?: Date
  createdAt: Date
  updatedAt: Date
}

export class WorkflowScheduler {
  private jobs = new Map<string, ScheduledJob>()
  private intervals = new Map<string, NodeJS.Timeout>()

  async scheduleWorkflow(
    workflowId: string,
    schedule: string,
    context: WorkflowContext
  ): Promise<ScheduledJob> {
    const job: ScheduledJob = {
      id: this.generateJobId(),
      workflowId,
      schedule,
      context,
      enabled: true,
      nextRun: this.calculateNextRun(schedule),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.jobs.set(job.id, job)
    this.startJob(job)

    return job
  }

  async unscheduleWorkflow(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job) return false

    this.stopJob(jobId)
    this.jobs.delete(jobId)
    return true
  }

  async enableJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job) return false

    job.enabled = true
    job.updatedAt = new Date()
    this.startJob(job)
    return true
  }

  async disableJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job) return false

    job.enabled = false
    job.updatedAt = new Date()
    this.stopJob(jobId)
    return true
  }

  async listJobs(workflowId?: string): Promise<ScheduledJob[]> {
    const jobs = Array.from(this.jobs.values())
    if (workflowId) {
      return jobs.filter(job => job.workflowId === workflowId)
    }
    return jobs
  }

  async getJob(jobId: string): Promise<ScheduledJob | undefined> {
    return this.jobs.get(jobId)
  }

  private startJob(job: ScheduledJob): void {
    if (!job.enabled) return

    this.stopJob(job.id) // Stop existing interval if any

    const interval = setInterval(async () => {
      if (!job.enabled) return

      try {
        job.lastRun = new Date()
        job.nextRun = this.calculateNextRun(job.schedule)
        job.updatedAt = new Date()

        // Mock workflow execution - in reality would get workflow definition
        const mockWorkflow: WorkflowDefinition = {
          id: job.workflowId,
          name: 'Scheduled Workflow',
          description: 'Workflow executed by scheduler',
          version: '1.0.0',
          nodes: [],
          connections: [],
          settings: {}
        }

        await workflowExecutor.executeWorkflow(mockWorkflow, job.context)
      } catch (error) {
        console.error(`Error executing scheduled job ${job.id}:`, error)
      }
    }, this.getIntervalMs(job.schedule))

    this.intervals.set(job.id, interval)
  }

  private stopJob(jobId: string): void {
    const interval = this.intervals.get(jobId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(jobId)
    }
  }

  private calculateNextRun(schedule: string): Date {
    // Mock next run calculation - in reality would parse cron expression
    const now = new Date()
    
    if (schedule.includes('minute')) {
      return new Date(now.getTime() + 60 * 1000) // 1 minute
    } else if (schedule.includes('hour')) {
      return new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
    } else if (schedule.includes('day')) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
    } else {
      return new Date(now.getTime() + 60 * 1000) // Default 1 minute
    }
  }

  private getIntervalMs(schedule: string): number {
    // Mock interval calculation - in reality would parse cron expression
    if (schedule.includes('minute')) {
      return 60 * 1000 // 1 minute
    } else if (schedule.includes('hour')) {
      return 60 * 60 * 1000 // 1 hour
    } else if (schedule.includes('day')) {
      return 24 * 60 * 60 * 1000 // 1 day
    } else {
      return 60 * 1000 // Default 1 minute
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup method
  destroy(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval)
    }
    this.intervals.clear()
    this.jobs.clear()
  }
}

// Global scheduler instance
export const workflowScheduler = new WorkflowScheduler()