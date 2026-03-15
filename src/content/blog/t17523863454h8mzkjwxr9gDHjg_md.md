---
title: "t17523863454h8mzkjwxr9gDHjg.md"
pubDatetime: 2026-03-15T08:47:46.252Z
tags: ["洛谷搬运"]
featured: false
draft: false
description: "t17523863454h8mzkjwxr9gDHjg.md - 迁移自洛谷博客"
---

# 我要吃串串！
posted on 2025-07-13 05:59:05 | under  | [source](https://www.luogu.com.cn/blog/_post/993903)

### exKMP

核心思想： 从已知信息扩展。

以下记 $s[i:j]$ 为 $s$ 在 $i\sim j$ 这一部分的子串。

Border：定义为 $s$ 的公共前后缀。例: $\text{aabcaa}$ 的 border 是 $\text{a,aa}$。

Z函数： $z(i)= \mathrm{LCP}(s,s[i:n])$。想要求解 $z(i)$ 。

对于所有的 $1< j \le i$， 找到 $\max \{j+z[j]-1\}$，设 $k$ 是这个最大值的下标 $j$。目前匹配到的最大下标 $p$ 就是 $k+z[k]-1$。 这里没有包含 $1$ 是因为 $z(1)= n$。
根据上述，我们可以得到 $s[1:z(k)]=s[k:p]$。

进行推导，若 $z(i-k)<k+z(k)-i-1$，有 $z(i)=z(i-k)$，否则，从 $i-k$ 进行枚举。

```cpp 
void Z(char *s,int n){
    z[1]=n;
    for(int i=2,l=0,r=0;i<=n;i++){
        //r是目前往右扩展到的位置 l是(j+z[j])最大的j
        if(i<=r)z[i]=min(z[i-l+1],r-i+1);
        while(i+z[i]<= n and s[i+z[i]]==s[z[i]+1])z[i]++;
        if(i+z[i]-1>r)l=i,r=i+z[i]-1;
    }
}
```

