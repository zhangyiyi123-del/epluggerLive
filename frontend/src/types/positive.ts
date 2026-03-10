// 正向行为分类
export interface PositiveCategory {
  id: string
  name: string
  icon: string // emoji
  description?: string
  isEnabled: boolean
  sortOrder: number
  isBuiltIn: boolean
  // 佐证要求: required - 必填, optional - 可选, exempt - 免佐证
  evidenceRequirement: 'required' | 'optional' | 'exempt'
  createdAt?: string
}

// 正向行为标签
export interface PositiveTag {
  id: string
  categoryId: string
  name: string
  isEnabled: boolean
  sortOrder: number
  isBuiltIn: boolean
}

// 关联同事
export interface RelatedColleague {
  userId: string
  name: string
  avatar?: string
  role: 'participant' | 'witness' // 参与人/见证人
}

// 佐证材料
export interface PositiveEvidence {
  id: string
  type: 'image' | 'file' | 'link'
  url: string
  name?: string
  uploadedAt: string
}

// 同事操作
export interface ColleagueAction {
  userId: string
  userName: string
  action: 'confirm' | 'reject' | 'like' | 'supplement'
  content?: string // 补充说明
  createdAt: string
}

// 正向打卡记录
export interface PositiveRecord {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  
  // 内容
  title?: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  tagIds: string[]
  tagNames: string[]
  description: string // 20-500字
  
  // 关联项
  relatedProject?: string
  relatedCustomer?: string
  relatedColleagues: RelatedColleague[]
  
  // 佐证
  evidences: PositiveEvidence[]
  evidenceRequirement: 'required' | 'optional' | 'exempt'
  
  // 状态
  status: 'draft' | 'pending' | 'confirmed' | 'rejected' | 'suspicious'
  suspiciousReason?: string
  
  // 同事互动
  colleagueActions: ColleagueAction[]
  confirmedCount: number
  rejectedCount: number
  likesCount: number
  
  // 时间
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  confirmDeadline?: string // 72小时后
  
  // 积分与评分
  points: number
  aiScore?: number
}

// 表单数据
export interface PositiveCheckInFormData {
  title?: string
  categoryId: string
  tagIds: string[]
  description: string
  relatedProject?: string
  relatedCustomer?: string
  relatedColleagues: RelatedColleague[]
  evidences: File[]
}

// 默认分类
export const DEFAULT_POSITIVE_CATEGORIES: PositiveCategory[] = [
  { 
    id: 'teamwork', 
    name: '团队协作', 
    icon: '🤝', 
    isEnabled: true, 
    sortOrder: 1, 
    isBuiltIn: true,
    evidenceRequirement: 'required',
    description: '跨部门协作、项目助力、经验分享'
  },
  { 
    id: 'culture', 
    name: '文化建设', 
    icon: '🎉', 
    isEnabled: true, 
    sortOrder: 2, 
    isBuiltIn: true,
    evidenceRequirement: 'optional',
    description: '团队活动、正向分享、同事互助'
  },
  { 
    id: 'growth', 
    name: '个人成长', 
    icon: '📈', 
    isEnabled: true, 
    sortOrder: 3, 
    isBuiltIn: true,
    evidenceRequirement: 'exempt',
    description: '技能学习、工作总结、正向心态'
  },
  { 
    id: 'other', 
    name: '其他正向', 
    icon: '✨', 
    isEnabled: true, 
    sortOrder: 4, 
    isBuiltIn: true,
    evidenceRequirement: 'optional',
    description: '公益参与、公司形象维护等'
  },
]

// 默认标签
export const DEFAULT_POSITIVE_TAGS: PositiveTag[] = [
  // 团队协作
  { id: 'cross-dept', categoryId: 'teamwork', name: '跨部门配合', isEnabled: true, sortOrder: 1, isBuiltIn: true },
  { id: 'project-help', categoryId: 'teamwork', name: '项目攻坚助力', isEnabled: true, sortOrder: 2, isBuiltIn: true },
  { id: 'exp-share', categoryId: 'teamwork', name: '团队经验分享', isEnabled: true, sortOrder: 3, isBuiltIn: true },
  
  // 文化建设
  { id: 'team-event', categoryId: 'culture', name: '团队活动参与', isEnabled: true, sortOrder: 1, isBuiltIn: true },
  { id: 'topic-share', categoryId: 'culture', name: '正向话题分享', isEnabled: true, sortOrder: 2, isBuiltIn: true },
  { id: 'colleague-help', categoryId: 'culture', name: '同事互助', isEnabled: true, sortOrder: 3, isBuiltIn: true },
  
  // 个人成长
  { id: 'skill-learn', categoryId: 'growth', name: '专业技能学习', isEnabled: true, sortOrder: 1, isBuiltIn: true },
  { id: 'work-summary', categoryId: 'growth', name: '工作心得总结', isEnabled: true, sortOrder: 2, isBuiltIn: true },
  { id: 'mindset', categoryId: 'growth', name: '正向心态表达', isEnabled: true, sortOrder: 3, isBuiltIn: true },
  
  // 其他正向
  { id: 'charity', categoryId: 'other', name: '公益参与', isEnabled: true, sortOrder: 1, isBuiltIn: true },
  { id: 'company-image', categoryId: 'other', name: '公司形象维护', isEnabled: true, sortOrder: 2, isBuiltIn: true },
]

// 模拟同事列表
export const MOCK_COLLEAGUES = [
  { userId: 'u1', name: '张三', avatar: '张' },
  { userId: 'u2', name: '李四', avatar: '李' },
  { userId: 'u3', name: '王五', avatar: '王' },
  { userId: 'u4', name: '赵六', avatar: '赵' },
  { userId: 'u5', name: '钱七', avatar: '钱' },
  { userId: 'u6', name: '孙八', avatar: '孙' },
  { userId: 'u7', name: '周九', avatar: '周' },
  { userId: 'u8', name: '吴十', avatar: '吴' },
]

// 模拟项目列表
export const MOCK_PROJECTS = [
  'APP重构项目',
  '小程序开发',
  '数据分析平台',
  '用户增长计划',
  '技术中台建设',
  '质量优化专项',
]

// 模拟客户列表
export const MOCK_CUSTOMERS = [
  '阿里巴巴',
  '腾讯科技',
  '字节跳动',
  '美团点评',
  '京东集团',
  '拼多多',
]
