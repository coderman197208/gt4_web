# admin-user-alarm-area-management Specification

## Purpose

定义 admin 在报警管理页中浏览普通用户目录、读取目标用户报警区域上下文以及整组替换其区域授权的管理行为。

## ADDED Requirements

### Requirement: 系统必须为 admin 提供只包含普通用户的报警管理目录

系统 SHALL 提供一个仅面向 admin 的普通用户目录接口，用于报警管理页选择目标用户；该目录不得包含 `admin` 账号。

#### Scenario: admin 查询报警管理用户目录时只看到普通用户

- **GIVEN** 系统中同时存在 `admin` 用户和普通用户
- **WHEN** admin 请求 `GET /api/admin/alarm-users`
- **THEN** 系统必须只返回 `role = user` 的用户目录项
- **AND** 每条目录项必须至少包含 `id`、`username`、`email` 和 `role`
- **AND** 返回结果中不得包含任何 `admin` 账号

#### Scenario: 非 admin 查询报警管理用户目录时被拒绝

- **GIVEN** 当前登录用户角色为 `user`
- **WHEN** 客户端请求 `GET /api/admin/alarm-users`
- **THEN** 系统必须拒绝该请求

### Requirement: 系统必须允许 admin 读取指定普通用户的报警区域上下文

系统 SHALL 允许 admin 读取指定普通用户的报警区域上下文，以便在管理页中展示该用户当前的默认区域和全部授权区域；目标账号若为 `admin`，系统不得将其作为可配置对象。

#### Scenario: admin 读取普通用户报警区域上下文时返回默认区域和授权区域

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 目标用户角色为 `user`
- **WHEN** admin 请求 `GET /api/users/:userId/alarm-areas`
- **THEN** 系统必须返回该普通用户的 `default_area_id`
- **AND** 系统必须返回该普通用户当前有权访问的全部报警区域

#### Scenario: admin 读取 admin 账号的报警区域上下文时被拒绝

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 目标用户角色也为 `admin`
- **WHEN** admin 请求 `GET /api/users/:userId/alarm-areas`
- **THEN** 系统必须拒绝该请求
- **AND** 系统不得把目标 `admin` 账号作为普通用户区域管理对象返回

#### Scenario: admin 读取不存在的用户报警区域上下文时被拒绝

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 请求中的 `userId` 不对应任何现有用户
- **WHEN** admin 请求 `GET /api/users/:userId/alarm-areas`
- **THEN** 系统必须拒绝该请求
- **AND** 系统不得返回空的区域授权上下文来掩盖不存在的目标用户

### Requirement: 系统必须允许 admin 整组替换普通用户报警区域授权

系统 SHALL 允许 admin 以整组替换的方式维护普通用户报警区域授权关系，并保证默认区域始终属于新的授权区域集合。

#### Scenario: admin 为普通用户保存新的区域授权集合

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 目标用户角色为 `user`
- **WHEN** admin 请求 `PUT /api/users/:userId/alarm-areas`，并提交新的 `area_ids` 与 `default_area_id`
- **THEN** 系统必须按请求体整组替换该普通用户的区域授权关系
- **AND** 系统必须保证 `default_area_id` 属于新的 `area_ids` 集合

#### Scenario: admin 保存完成后重新读取该用户上下文时看到最新结果

- **GIVEN** admin 已成功为某个普通用户保存新的报警区域集合
- **WHEN** admin 再次请求 `GET /api/users/:userId/alarm-areas`
- **THEN** 系统必须返回最新保存后的默认区域和授权区域集合

#### Scenario: 非 admin 或针对 admin 目标账号的授权写入请求被拒绝

- **GIVEN** 当前登录用户不是 `admin`，或者目标用户角色为 `admin`
- **WHEN** 客户端请求 `PUT /api/users/:userId/alarm-areas`
- **THEN** 系统必须拒绝该请求
- **AND** 系统不得修改任何用户区域授权关系

#### Scenario: 针对不存在用户的授权写入请求被拒绝

- **GIVEN** 当前登录用户角色为 `admin`
- **AND** 请求中的 `userId` 不对应任何现有用户
- **WHEN** admin 请求 `PUT /api/users/:userId/alarm-areas`
- **THEN** 系统必须拒绝该请求
- **AND** 系统不得创建孤立的用户区域授权记录
