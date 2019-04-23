## I'am a newbie. This app is just a try. And many functions are unable to use also includes bugs. 
## If you are interested, you can install to preview, use ggit start

##  我是名新手，软件仅仅是个尝试, 很多功能没有实现, 包括存在许多bug 如果你感兴趣,可以尝试一下, 使用ggit start启动

# installation 

```
    window + x -> windows powershell(A) 管理员权限
    npm install ggit-gui -g
```

# usage 

```
    ggit start  // start app/启动
    ggit --help // help/查看帮助
    ggit quick < url > // quick push item to GitHub/快速推送项目到github  ggit --help 暂未实现
```

# shortcuts  useless/暂未实现
```
alt + 1 new repo/新建仓库
alt + 2 clone/克隆
alt + 3 setting/设置
alt + 4 dark/黑夜模式
```
# bugs 
    i am not able to resolve `git log ` that print out large data, and use `spawn` always print maxsize  stack/

    git log 如果有大量输出数据不知道怎么解决


# history  
---------------------------------------------------------------------------------------
    2019/4/23
    rename to ggit-gui 
    go on developing
---------------------------------------------------------------------------------------
    2019/3/1
    add switch branch/ 添加切换分支
    add ggit offline reader / 添加离线阅读项目(highlight.js bug);
    add commit / 添加提交message
    add .gitingore / 添加 .gitingore
---------------------------------------------------------------------------------------
    2019/2/1
    support english / 支持英语
    commit popup / commit message 弹出窗
    dark dode partial adaptation / 适配部分黑暗模式
    resolve bugs / 修复些bug
