---
title: "t1720570314A_WEfh6hNBIJL_Ca.md"
pubDatetime: 2026-03-15T08:47:46.267Z
tags: ["洛谷搬运"]
featured: false
draft: false
description: "t1720570314A_WEfh6hNBIJL_Ca.md - 迁移自洛谷博客"
---

# CF1791G2 题解
posted on 2024-07-10 00:11:54 | under  | [source](https://www.luogu.com.cn/blog/_post/775049)

## 题意

一条直线上有 $n$ 个传送点，第 $i$ 个点可以花费 $a_i$ 的代价传送到 $0$ 或者 $n+1$，初始时在 $0$ 点，移动 $1$ 步有 $1$ 的代价，每个点只能传送一次，求在 $c$ 的代价内最多能传送多少次。

## 思路

这道题乍一看和简化版非常相似，唯一的差别就是可以选择传送到 $n+1$，那么选择沿用贪心思路，记录在每个点传送的代价和从两个端点到这个点所用代价的更小值的和作为总代价，从小到大进行排序。

注意到有一个限制条件是第一次传送必须从 $0$ 过去，那么枚举第一次使用的点，并且在计算最多能使用的传送点的时候将从 $0$ 到第一个点的代价记录。具体的，使用前缀和记录前 $i$ 个（排序后）传送点的总代价，二分最多次数 $mid$，比较前缀和第 $mid$ 项和 $c$，如果第一个传送点不在前 $mid$ 个传送点内便将其加入，并记录花费。如果第一个点在前 $mid$ 个传送点内，则更新其花费，更改为从 $0$ 到这个点的花费，时间复杂度 $O(n \log n)$。

## 代码

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+5;
#define int ll
int t,n,c,a[N];
struct node{
    int val,id;
    bool operator<(const node &A)const{
        return this->val<A.val;
    }
}v[N];
int s[N],wz[N];
bool check(int mid,int i){
    int t=max(0ll,i-n-1+i);
    if(wz[i]<=mid)return (s[mid]+t<=c);
    else return (s[mid-1]+a[i]+i<=c);
}
signed main(){
    cin>>t;
    while(t--){
        cin>>n>>c;
        for(int i=1;i<=n;i++){
            cin>>a[i];
            v[i].id=i;
            v[i].val=a[i]+min(i,n+1-i);
        }
        sort(v+1,v+1+n);
        for(int i=1;i<=n;i++){
            s[i]=s[i-1]+v[i].val;
            wz[v[i].id]=i;
        }
        int ans=0;
        for(int i=1;i<=n;i++){
            int l=0,r=n,mid;
            while(l<=r){
                mid=(l+r)/2;
                if(check(mid,i))l=mid+1;
                else r=mid-1;
            }
            ans=max(ans,r);
        }
        cout<<ans<<endl;
    }
    return 0;
}
```

