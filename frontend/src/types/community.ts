// 用户基础信息
export interface User {
  id: string
  name: string
  avatar?: string
  department: string
  position?: string
}

// 已关注用户摘要（用于「关注」标签下横向列表展示）
export interface FollowedUser {
  id: string
  name: string
  avatar?: string
  department: string
}

// 可见范围
export type VisibilityType = 'company' | 'department' | 'project' | 'custom'

export interface Visibility {
  type: VisibilityType
  departmentIds?: string[]
  projectIds?: string[]
  userIds?: string[]
}

// 关联的打卡记录
export interface RelatedCheckIn {
  id: string
  type: 'exercise' | 'positive'
  title: string
  summary: string
  detailUrl: string
}

// 话题标签
export interface Topic {
  id: string
  name: string
  postCount: number
  coverImage?: string
  isFollowing?: boolean
}

// 动态内容
export interface PostContent {
  text: string
  images: string[]
  video?: {
    url: string
    duration: number
    cover: string
  }
  emotions: string[]
}

// @提及
export interface Mention {
  type: 'user' | 'department'
  id: string
  name: string
  startIndex: number
  endIndex: number
}

// 动态
export interface Post {
  id: string
  author: User
  content: PostContent
  visibility: Visibility
  relatedCheckIn?: RelatedCheckIn
  topics: Topic[]
  mentions: Mention[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  isCollected: boolean
  isAuthorFollowed: boolean
  isFeatured: boolean
  isPinned: boolean
  canEdit: boolean
  canDelete: boolean
  createdAt: string
  updatedAt?: string
}

// 评论
export interface Comment {
  id: string
  postId: string
  author: User
  content: string
  emotions: string[]
  mentions: Mention[]
  parentId?: string
  replies?: Comment[]
  likesCount: number
  isLiked: boolean
  createdAt: string
}

// 筛选类型
export type FeedFilter = 'latest' | 'popular' | 'department' | 'following'

// 动态筛选选项
export interface FeedFilterOption {
  value: FeedFilter
  label: string
  icon: string
}

export const FEED_FILTERS: FeedFilterOption[] = [
  { value: 'latest', label: '最新', icon: '🕐' },
  { value: 'popular', label: '热门', icon: '🔥' },
  { value: 'department', label: '本部门', icon: '🏢' },
  { value: 'following', label: '关注', icon: '❤️' },
]

// 表单数据
export interface PostFormData {
  content: PostContent
  visibility: Visibility
  relatedCheckIn?: RelatedCheckIn
  topics: Topic[]
  mentions: Mention[]
}

// 内置正向表情
export const POSITIVE_EMOJIS = [
  '👍', '👏', '💪', '🎉', '❤️', '✨', '🌟', '🏆', '💯', '🚀',
  '😊', '🙌', '🤝', '💡', '🎯', '⭐', '🌈', '🍀', '💪', '🦋'
]

// 热门话题
export const MOCK_TOPICS: Topic[] = [
  { id: 't1', name: '运动打卡', postCount: 256, isFollowing: false },
  { id: 't2', name: '团队协作', postCount: 189, isFollowing: true },
  { id: 't3', name: '学习成长', postCount: 156, isFollowing: false },
  { id: 't4', name: '正向分享', postCount: 134, isFollowing: false },
  { id: 't5', name: '健康生活', postCount: 98, isFollowing: false },
]

// 模拟动态数据
export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    author: { id: 'u1', name: '张明', avatar: '张', department: '技术部' },
    content: {
      text: '今天完成了晨跑10公里，感觉整个人都清爽了！🏃‍♂️ 坚持打卡第30天，期待遇见更好的自己。',
      images: [],
      emotions: ['💪', '🎉']
    },
    visibility: { type: 'company' },
    topics: [{ id: 't1', name: '运动打卡', postCount: 256 }],
    mentions: [],
    likesCount: 24,
    commentsCount: 8,
    isLiked: false,
    isCollected: false,
    isFeatured: true,
    isPinned: false,
    canEdit: false,
    canDelete: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p2',
    author: { id: 'u2', name: '李华', avatar: '李', department: '产品部' },
    content: {
      text: '感谢同事小王帮我解决了那个bug，热心帮助他人的感觉真好！💡 也提醒大家，遇到问题随时找我交流～',
      images: [],
      emotions: ['👍', '❤️']
    },
    visibility: { type: 'company' },
    topics: [{ id: 't2', name: '团队协作', postCount: 189 }],
    mentions: [],
    likesCount: 36,
    commentsCount: 12,
    isLiked: true,
    isCollected: false,
    isFeatured: false,
    isPinned: false,
    canEdit: false,
    canDelete: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p3',
    author: { id: 'u3', name: '王芳', avatar: '王', department: '设计部' },
    content: {
      text: '今天分享了一个设计资源包，收到了很多好评！📚 知识就是要分享才更有价值，期待和大家有更多交流～',
      images: [],
      emotions: ['✨', '💡']
    },
    visibility: { type: 'company' },
    topics: [{ id: 't3', name: '学习成长', postCount: 156 }],
    mentions: [],
    likesCount: 18,
    commentsCount: 5,
    isLiked: false,
    isCollected: false,
    isFeatured: false,
    isPinned: false,
    canEdit: false,
    canDelete: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  // 文本超过三行 + 图片示例
  {
    id: 'p4',
    author: { id: 'u4', name: '赵强', avatar: '赵', department: '运营部' },
    content: {
      text:
        '这段时间在准备公司年度分享会，整理了很多过往项目的复盘心得。\n' +
        '发现一个很有意思的现象：真正让团队成长的，往往不是一开始就做对的决定，\n' +
        '而是那些犯过错、但最终一起扛过去并且总结出来的经验。\n' +
        '希望这次分享可以帮到更多同事，少踩一些我们踩过的坑，也欢迎大家一起来补充自己的故事～',
      images: [
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        'https://images.pexels.com/photos/1181355/pexels-photo-1181355.jpeg'
      ],
      emotions: ['✨', '🤝', '💡']
    },
    visibility: { type: 'company' },
    topics: [{ id: 't3', name: '学习成长', postCount: 156 }],
    mentions: [],
    likesCount: 42,
    commentsCount: 9,
    isLiked: false,
    isCollected: false,
    isFeatured: false,
    isPinned: false,
    canEdit: false,
    canDelete: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  // 仅图片为主的示例
  {
    id: 'p5',
    author: { id: 'u5', name: '孙丽', avatar: '孙', department: '市场部' },
    content: {
      text:
        '周末和同事一起完成了一次线下路跑活动，沿途风景太美了，忍不住多拍了几张照片分享给大家。\n' +
        '欢迎下次有更多小伙伴一起加入，我们也准备了不少小礼品～',
      images: [
        'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg',
        'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg',
        'https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg'
      ],
      emotions: ['🏃‍♂️', '🌅', '🎉']
    },
    visibility: { type: 'company' },
    topics: [{ id: 't1', name: '运动打卡', postCount: 256 }],
    mentions: [],
    likesCount: 31,
    commentsCount: 6,
    isLiked: false,
    isCollected: false,
    isFeatured: true,
    isPinned: false,
    canEdit: false,
    canDelete: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
]

// 模拟用户
export const MOCK_CURRENT_USER: User = {
  id: 'current',
  name: '我',
  avatar: '我',
  department: '技术部'
}
