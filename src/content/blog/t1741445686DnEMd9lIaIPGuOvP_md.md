---
title: "t1741445686DnEMd9lIaIPGuOvP.md"
pubDatetime: 2026-03-15T08:47:46.259Z
tags: ["洛谷搬运"]
featured: false
draft: false
description: "t1741445686DnEMd9lIaIPGuOvP.md - 迁移自洛谷博客"
---

# K短路 学习笔记
posted on 2025-03-08 14:54:46 | under  | [source](https://www.luogu.com.cn/blog/_post/932760)

[留档提交记录，供以后闲暇的时候慢慢调。](https://www.luogu.com.cn/record/206767996)

题外话：这方面题解感觉都不是很精确，OI-Wiki的代码甚至还会CE，模板题题解第一篇也是错的……

给定一张图，求 $s$ 到 $t$ 的第（前） $k$ 短路径。

由于A*的最坏复杂度为 $O(nk \log k)$ ，故写一下可持久化可并堆的做法。

令 $(x,i)$ 代表从 $s$ 到 $x$ ，长度为 $i$ 的状态。

首先，构造一棵“最短路树”，根为 $t$，其上面每一个节点到根的路径为最短路径，这棵树可以用 $\mathrm{Dijsktra}$ 求解 $t$ 的单汇最短路径得到。可以发现，上面 $(x,i)+x$ 到 $t$ 的最短路树上的路径对应一条 $s$ 到 $t$ 的路径，即一种方案。

考虑 $(x,i)$ 的后继状态，我们不能枚举所有出边 $w_{(x,y)}$ ，因为如果这条边就是 $x$ 在最短路树上的边那么实际上这两个状态 $(y,i+w_{(x,y)})$ 和 $(x,i)$ 对应的是同一个路径。同时，如果直接去掉这一条边，那么就相当于去掉了 $x$ 的祖先的所有状态（即只留下了从 $x$ 走树上路径的方案，而对于 $x$ 的祖先会遗漏一些从 $x$ 的祖先往外走的状态）。

我们转化一下枚举方式，从枚举出边到枚举从 $x$ 继续往后走的第一条非树边，即可保持不重不漏统计。

于是，对于 $(x,i)$，我们枚举所有 $x$ 及其祖先 $u$ 的所有非树边 $w_{(u,v)}$ ，后继状态为 $(v,i+dep_x-dep_u+w_{(u,v)})$ ，我们发现对于这些状态 $i$ 都是统一加入的，把 $i$ 提出来，可以认为重要的是得到所有可能的 $(v,dep_x-dep_u+w_{(u,v)})$ 的集合（因为只和 $x$ 有关，只要 $x$ 确定了集合就是确定的，记为 $S_x$），$i$ 珂以后续通过懒标记添加。

现在主要的问题就是快速的求解每个 $S_x$ 。令 $x$ 在最短路树上的（直接）父节点为 $y$ ，于是 $S_x$ 就是 $S_y$ 加上自己的非树边。只需要做的就是将所有 $S_y$ 元素第二项都增加 $w_{(x,y)}$ ，然后将 $x$ 自己的非树边加入集合。上述这个过程珂以分解为：复制一个集合，全体增加，元素插入，以及最后查询最小值，发现可持久化左偏树珂以维护这个东西。

求解出每个 $S_x$ 之后，扩展 $(x,i)$ 的后续状态，相当于在已有的堆中添加所有 $S_x$ 的元素（第二项添加 $i$ ），通过打懒标记和合并 $S_x$ 与目前的堆得到。我们需要保留 $S_x$ 以供后继转移，所以合并也需要可持久化。

询问时使用优先队列维护可并堆的根，这样我们只需要操作 $k$ 次堆，总复杂度为 $O((n+m) \log m + k \log k)$ 。

代码调了4h没出来。等有机会再补上吧。

P2483 10pts（WA）：

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const int N=2e5+5;
const double eps=1e-8;
struct edge{
    int to,nxt;
    double val;
}es1[N<<1],es2[N<<1];
//es1 为正图，es2为反图
//求在e的总和内 1-n的不同路径数最多有多少条（k短路）
int ecnt1,ecnt2;
int head1[N],head2[N];
void addedge1(int u,int v,double w){
    es1[++ecnt1].to=v;
    es1[ecnt1].val=w;
    es1[ecnt1].nxt=head1[u];
    head1[u]=ecnt1;
}
void addedge2(int u,int v,double w){
    es2[++ecnt2].to=v;
    es2[ecnt2].val=w;
    es2[ecnt2].nxt=head2[u];
    head2[u]=ecnt2;
}
int n,m;
double e;
// struct node{
//     int id;
//     double val;
//     node(){}
//     node(int U,double W){id=U,val=W;}
//     bool operator<(const node &A)const{return val>A.val;}
//     // node operator=(const node &A){id=A.id,val=A.val;}
// };
// priority_queue<node> q;
priority_queue<pair<double ,int> > q;
#define mp(x,y) make_pair(x,y)
bool vis[N];double dis[N];
void dijsktra(int s){
    //反图跑dij
    memset(dis,127,sizeof dis);
    dis[s]=0;
    q.push(mp(0,s));
    while(q.size()){
        int t=q.top().second;q.pop();
        if(vis[t])continue;
        vis[t]=1;
        for(int i=head2[t];i;i=es2[i].nxt){
            if(dis[es2[i].to]>dis[t]+es2[i].val){
                dis[es2[i].to]=dis[t]+es2[i].val;
                q.push(mp(-dis[es2[i].to],es2[i].to));
            }
        }
    }
}
bool ontree[N];//ontree[i] 第i条边是否是树边
int fa[N];//每个节点的父节点
void dfs(int x){
    //构建最短路树
    vis[x]=1;
    for(int i=head2[x];i;i=es2[i].nxt){
        if(!vis[es2[i].to]){
            if(fabs(-dis[es2[i].to]+dis[x]+es2[i].val)<eps){
                fa[es2[i].to]=x;
                ontree[i]=1;
                dfs(es2[i].to);
            }
        }
    }
}
struct heap{
    //可持久化左偏树
    int ls,rs,dis,ed;
    double w;
}tr[N*20];
int tot;
int newnode(double w,int ed){
    tot++;
    tr[tot].w=w;tr[tot].dis=1;tr[tot].ed=ed;
    return tot;
}
int merge(int x,int y){
    if(!x or !y)return x|y;
    if(tr[x].w-tr[y].w>=eps)swap(x,y);
    tot++;
    tr[tot]=tr[x],tr[tot].rs=merge(tr[tot].rs,y);
    if(tr[tr[tot].ls].dis<tr[tr[tot].rs].dis)swap(tr[tot].ls,tr[tot].rs);
    tr[tot].dis=tr[tr[x].rs].dis+1;
    return tot;
}
int rt[N];//根的集合
int main(){
    cin>>n>>m>>e;
    int u,v;
    double w;
    for(int i=1;i<=m;i++){
        cin>>u>>v>>w;
        addedge1(u,v,w);
        addedge2(v,u,w);
    }
    dijsktra(n);
    memset(vis,0,sizeof vis);
    dfs(n);
    // cerr<<"okok"<<endl;
    for(int i=1;i<=ecnt2;i++){
        if(!ontree[i]){
            u=es2[i].to,v=es1[i].to;
            if(dis[u]==dis[0] or dis[v]==dis[0])continue;
            rt[u]=merge(rt[u],newnode((dis[v]+es1[i].val-dis[u]),v));
        }
    }
    for(int i=1;i<=n;i++)q.push(mp(-dis[i],i));
    for(int i=1;i<=n;i++){
        u=q.top().second;q.pop();
        if(fa[u])rt[u]=merge(rt[u],rt[fa[u]]);
    }
    int ans=0;
    if(dis[1]-e<eps)e-=dis[1],ans++;
    if(rt[1])q.push(mp(-tr[rt[1]].w,rt[1]));
    while(q.size()){
		int ed=q.top().second;
		double cur=q.top().first,w=dis[1]-cur;
		if(w-e>=eps)break;
		q.pop();
        e-=w;
        ans++;
        int nxt=tr[u].rs;
        if(nxt)q.push(mp(cur+tr[ed].w-tr[nxt].w,nxt));
        nxt=tr[u].ls;
        if(nxt)q.push(mp(cur+tr[ed].w-tr[nxt].w,nxt));
		if(rt[tr[ed].ed])
        q.push(mp(cur-tr[rt[tr[ed].ed]].w,rt[tr[ed].ed]));
	}
    // while(q.size()){
    //     u=q.top().id;
    //     double tmp=-1*q.top().val;
    //     w=dis[1]-tmp;
    //     if(w-e>=eps)break;
    //     q.pop();
    //     e-=w;ans++;
    //     // cerr<<e<<" "<<w<<" "<<dis[1]<<endl;
    //     int nxt=tr[u].rs;
    //     if(nxt)q.push(node(nxt,-1*(tmp+tr[u].w-tr[nxt].w)));
    //     nxt=tr[u].ls;
    //     if(nxt)q.push(node(nxt,-1*(tmp+tr[u].w-tr[nxt].w)));
    //     if(rt[tr[u].ed])q.push(node(rt[tr[u].ed],-1*(tmp-tr[rt[tr[u].ed]].w)));
    // }
    cout<<ans<<endl;
    return 0;
}
```

