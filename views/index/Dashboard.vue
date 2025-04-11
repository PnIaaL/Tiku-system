<template>
  <el-scrollbar :native="false" style="height: 100%">
    <div>
      <h1 class="title">
        <a href="#" target="_blank">题库管理系统</a>
      </h1>
    </div>
  </el-scrollbar>
</template>

<script>
  export default {
    name: 'Dashboard',
  }
</script>

<style scoped lang="scss">
  div {
    animation: leftMoveIn .7s ease-in;
  }

  @keyframes leftMoveIn {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0%);
      opacity: 1;
    }
  }

  .title {
    text-align: center;
    font-size: 25px;
  }


  p {
    text-indent: 2em;
  }

  a {
    text-decoration: none
  }
</style>
