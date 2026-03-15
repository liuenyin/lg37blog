---
title: "t1743941146-_oA1ONogY53wvgl.md"
pubDatetime: 2026-03-15T08:47:46.255Z
tags: ["洛谷搬运"]
featured: false
draft: false
description: "t1743941146-_oA1ONogY53wvgl.md - 迁移自洛谷博客"
---

# 做题笔记
posted on 2025-04-06 12:05:46 | under  | [source](https://www.luogu.com.cn/blog/_post/947049)

做题时的一些想法/思路，随便写一下。

### P6845/CF1192B

给定一棵树，每次会修改一条边的权值，求修改后树的直径，强制在线。 $n,q\leq 10^5$ ，出现的数均为正整数。

由于直径可以用DFS+LCA求解，LCA又可以通过欧拉序转化为序列上的问题，我们将这棵树压到欧拉序里。

>对一棵树进行 DFS，无论是第一次访问还是回溯，每次到达一个结点时都将编号记录下来，可以得到一个长度为 $2n-1$ 的序列，这个序列被称作这棵树的欧拉序列。

于是 $dist(u,v)=dis(u)+dis(v)-2dis(lca)$ ，其中 $dis(u)$ 是 $1\to u$ 的距离。树的直径便是上述式子的最大值。既然转成了一个RMQ问题，考虑使用线段树维护。由于边权都是正数，$dis(lca)= \min_{i=pos(u)}^{pos(v)} dis(i)$ ，$pos(x)$ 代表 $x$ 在序列中的第一次出现位置。 

考虑如何维护上述答案使得能用线段树合并答案。可以拆成三部分： $dis(u),dis(v),\min_{i=pos(u)}^{pos(v)} dis(i)$ 。我们维护以下的东西：

$mx= \max\{dis(u)\}$

$mn= \min\{dis(u)\}$ 

$res=\max\{dis(u)+dis(v)-2dis(lca)\},u,v\in [l,r]$

$rmx=\max\{dis(u)-2dis(i)\}$（看作还需要在区间 $(mid,r]$ 找一个最大值凑答案）

$lmx=\max\{dis(u)-2dis(i)\}$（还需在左边找一个端点）

由于 LCA 是欧拉序中 $[pos(u),pos(v)]$ 中 $dis$ 最小的一个点，因此错误的答案（即由 $lmx,rmx$ 找错端点了）一定不优于正确答案，即不会产生影响。

然后 `pushup` 函数：

```cpp
#define ls t[p*2]
#define rs t[p*2+1]
void pushup(int p){
    t[p].mx=max(ls.mx,rs.mx);
    t[p].mn=min(ls.mn,rs.mn);
    t[p].lmx=max(max(ls.lmx,rs.lmx),rs.mx-2*ls.mn);
    t[p].rmx=max(max(ls.rmx,rs.rmx),ls.mx-2*rs.mn);
    t[p].res=max(max(ls.res,rs.res),max(ls.mx+rs.lmx,rs.mx+ls.rmx));
}
```

