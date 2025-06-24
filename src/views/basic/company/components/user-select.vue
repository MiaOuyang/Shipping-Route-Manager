<template>
  <el-select
    v-model="selectedUserId"
    placeholder="请选择用户"
    clearable
    filterable
    remote
    :remote-method="handleSearch"
    :loading="loading"
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="user in userList"
      :key="user.userId"
      :label="`${user.nickname} (${user.username})`"
      :value="user.userId"
    >
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div>
          <el-avatar
            v-if="user.avatar"
            :src="user.avatar"
            :size="24"
            style="margin-right: 8px"
          />
          <el-avatar
            v-else
            :size="24"
            style="background: var(--el-color-primary); margin-right: 8px"
          >
            {{ user.nickname ? user.nickname.substring(0, 2) : 'U' }}
          </el-avatar>
          <span>{{ user.nickname }}</span>
        </div>
        <span style="color: #999; font-size: 12px">{{ user.username }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  companyId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectedUserId = ref(props.modelValue);
const userList = ref([]);
const loading = ref(false);
const searchKeyword = ref('');

// 模拟用户数据
const mockUsers = [
  { userId: 1, nickname: '系统管理员', username: 'admin', avatar: '' },
  { userId: 2, nickname: '张明', username: 'zhang.ming', avatar: '' },
  { userId: 3, nickname: '李强', username: 'li.qiang', avatar: '' },
  { userId: 4, nickname: '王芳', username: 'wang.fang', avatar: '' },
  { userId: 5, nickname: 'John Smith', username: 'john.smith', avatar: '' },
  { userId: 6, nickname: 'Marco Rossi', username: 'marco.rossi', avatar: '' },
  { userId: 7, nickname: 'Pierre Martin', username: 'pierre.martin', avatar: '' },
  { userId: 8, nickname: '陈志明', username: 'chen.zm', avatar: '' },
  { userId: 9, nickname: '刘伟', username: 'liu.wei', avatar: '' },
  { userId: 10, nickname: '张海华', username: 'zhang.hh', avatar: '' },
  { userId: 11, nickname: 'Hans Schmidt', username: 'hans.schmidt', avatar: '' },
  { userId: 12, nickname: '王远航', username: 'wang.yh', avatar: '' },
  { userId: 13, nickname: '李港生', username: 'li.gs', avatar: '' },
  { userId: 14, nickname: '赵运达', username: 'zhao.yd', avatar: '' },
  { userId: 15, nickname: '林阳明', username: 'lin.ym', avatar: '' },
  { userId: 16, nickname: '周海通', username: 'zhou.ht', avatar: '' },
  { userId: 17, nickname: '李静', username: 'li.jing', avatar: '' },
  { userId: 18, nickname: '张伟', username: 'zhang.wei', avatar: '' },
  { userId: 19, nickname: '王丽', username: 'wang.li', avatar: '' },
  { userId: 20, nickname: '陈刚', username: 'chen.gang', avatar: '' }
];

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  selectedUserId.value = newVal;
});

// 搜索用户
const handleSearch = async (query) => {
  if (query !== searchKeyword.value) {
    searchKeyword.value = query;
    loading.value = true;
    
    // 模拟搜索延迟
    setTimeout(() => {
      if (query) {
        userList.value = mockUsers.filter(user => 
          user.nickname.includes(query) || user.username.includes(query)
        );
      } else {
        userList.value = mockUsers.slice(0, 10);
      }
      loading.value = false;
    }, 300);
  }
};

// 选择变化
const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', {
    companyId: props.companyId,
    userId: value,
    user: userList.value.find(u => u.userId === value)
  });
};

// 初始化时加载一些用户数据
const initUserList = async () => {
  loading.value = true;
  setTimeout(() => {
    userList.value = mockUsers.slice(0, 10);
    loading.value = false;
  }, 200);
};

// 组件挂载时初始化
initUserList();
</script> 