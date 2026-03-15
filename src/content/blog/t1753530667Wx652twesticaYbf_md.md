---
title: "t1753530667Wx652twesticaYbf.md"
pubDatetime: 2026-03-15T08:47:46.251Z
tags: ["洛谷搬运"]
featured: false
draft: false
description: "t1753530667Wx652twesticaYbf.md - 迁移自洛谷博客"
---

# 多重条件问题
posted on 2025-07-26 11:51:07 | under  | [source](https://www.luogu.com.cn/blog/_post/1006351)

有一些方案，有 $n$ 个条件，编号为 $1,2,...,n$，每个方案都会满足 $n$ 个条件中的某些条件，而不满足另外条件。
可能会有一个问题：给定一个条件的子集 $S$，求恰好满足 $S$ 中的条件，而不满足其余条件的方案数。因为我们明确指定了每个条件是否要满足，所以我们可以把这叫做多重条件的**精确控制**问题，将这个问题的答案记为 $g_S$。
例：

- 排列顺序问题：对于所有 $1,2,...,n+1$ 的排列 $p$，令第 $i$ 个条件为 $p_i<p_{i+1}$，我们想知道恰好满足 $S$ 中的条件，还没满足其他条件的排列数是多少。

- 错排问题：有 $n$ 个人，每个人都有一个专属座位，求每个人都坐错座位的方案数。

很多时候我们无法直接求出 $g_S$，但我们可以换一种问法：能够满足 $S$ 中的条件，其余条件满不满足都行的方案数有多少？我们将其称为 **部分满足**问题，记这个问题的答案为 $f_S$。

有时候，求解 $f_S$ 可能比求解 $g_S$ 容易许多。令全集 $U=\{1,2,...,n\}$，则有：$f_S=\sum \limits_{S\subseteq T \subseteq U} g_T$。例如：

- 排列顺序问题：求恰好满足 $S$ 中的条件，没满足其他条件的排列数 $g_S$ 比较困难，但是求满足了 $S$ 中的条件，其余条件满不满足都行的排列数 $f_S$ 比较容易。这样排列就被小于号分成了若干段，每一段都是一个递增的序列，段和段之间关系任意，假设每段长度为 $l_i$，则 $f_S=\binom{n+1}{l_1,l_2,...,l_m}=\frac{(n+1)!}{l_1!l_2!...l_m!}$。

除此之外，还可以定义**部分违背**问题：$S$ 中的东西满不满足都行，其余条件必须违背的方案数是多少？记这个问题的答案为 $h_S$，有 $h_S=\sum \limits_{T\subseteq S} g_T$。有时候求解 $h_S$ 会更简单。

- 错排问题：求每个人都坐位置的方案较困难，但是求 $S$ 中的人坐不坐对位置都行，其余人坐对位置的方案数 $h_S$ 比较容易。$S$ 里的人可以随便坐，方案数为 $|S|!$。

我们实际想求的是 $g_S$，那么能不能反推出 $g_S$ 呢？

有以下结论（标准容斥公式）：

$$h(S)= \sum \limits_{T \subseteq S} g(T)\Leftrightarrow g(S)=\sum \limits_{T\subseteq S} (-1)^{|S|-|T|} f(T)$$

证明如下：

$$\begin{aligned}\sum \limits_{T\subseteq S}(-1)^{|S|-|T|} h(T)&= \sum \limits_{T\subseteq S} (-1)^{|S|-|T|}\sum \limits_{Q\subseteq T} g(Q)\\
&= \sum \limits_{Q} g(Q) \sum \limits_{Q\subseteq T \subseteq S}(-1)^{|S|-|T|}\\&= \sum \limits_{Q} g(Q) \sum \limits_{T\subseteq (S-Q)} (-1)^{|S-Q|-|T|}
\end{aligned}$$

把后面的单拿出来，记
$\begin{aligned}F(P)&=\sum \limits_{T\subseteq P}(-1)^{|P|-|T|}=\sum \limits_{i=0}^{|P|}\binom{|P|}{i}(-1)^{|P|-i} \\&=\sum \limits_{i=0}^{|P|} \binom{|P|}{i} 1^i (-1)^{|P|-i} =(1-1)^{|P|}=0^{|P|}\end{aligned}$

于是原式 $=\sum \limits_{Q} g(Q) 0^{|S-Q|}=g(S)$。

类似的，有推论 $f(S)=\sum \limits_{S\subseteq T}g(T) \Leftrightarrow g(S)=\sum \limits_{S\subseteq T} (-1)^{|T|-|S|}f(T)$

于是这几个就可以互推。

