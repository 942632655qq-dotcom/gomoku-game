# BugFix 记录

## gomoku-game 项目问题分析

### Bug 1: 棋盘星位网格线缺失

- **文件**: `css/pages/game.css`
- **问题**: 星位单元格的 `::before` 和 `::after` 伪元素设置了 `background: none`，导致穿过星位的经纬线消失
- **修复**: 移除该规则，给星位圆点 `<span>` 添加 `position: relative; z-index: 2` 使其叠在网格线上方

### Bug 2: 死代码 — `Utils.empty()` 未被使用

- **文件**: `js/utils.js`
- **问题**: `Utils.empty()` 方法已定义但项目中无任何调用
- **修复**: 删除该函数

### 改进 3: Undo 按钮缺少禁用状态

- **文件**: `js/pages/Game.js`
- **问题**: 游戏结束后 Undo 按钮逻辑上被阻止但视觉上无禁用反馈
- **修复**: 新增 `setUndoEnabled()` 方法，游戏结束时禁用按钮，添加 `.btn:disabled` 样式

### 改进 4: 比分未持久化

- **文件**: `js/pages/Game.js`
- **问题**: 比分仅存储在内存中，刷新页面后丢失
- **修复**: 新增 `loadScores()` / `saveScores()` 方法，通过 `localStorage` 存取比分
