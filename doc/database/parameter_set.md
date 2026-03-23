---
table name: parameter_set
description: 生产参数数据库表.
---

# 创建脚本及字段定义：

```sql
-- DROP TABLE parameter_set;

CREATE TABLE parameter_set (
    order_no varchar(10) NULL,
    item_no varchar(3) NULL,
    diameter numeric(5, 2) NULL,
    thickness numeric(4, 2) NULL,
    direction_code varchar(8) NULL,
    bundle_type varchar(8) NULL,
    bundle_number int NULL,
    produce_job_point varchar(8) NULL,
    order_weight int NULL,
    lot_no varchar(8) NULL,
    roll_no varchar(8) NULL,
    melt_no varchar(8) NULL,
    melt_no_coupling varchar(8) NULL,
    lot_no_coupling varchar(8) NULL,
    flow_no int NULL,
    feed_number int NULL,
    length_coupling real NULL,
    weight_coupling real NULL,
    weight_packging real NULL,
    length_enable int NULL,
    weight_enable int NULL,
    circle_enable int NULL,
    carve_enable int NULL,
    spray_enable int NULL,
    waste_length_enable int NULL,
    waste_weight_enable int NULL,
    gun1 int NULL,
    gun2 int NULL,
    gun3 int NULL,
    gun4 int NULL,
    gun5 int NULL,
    gun_clear int NULL,
    circle_time int NULL,
    spray_length_type int NULL,
    spray_weight_type int NULL,
    spray_length_precision int NULL,
    spray_weight_precision int NULL,
    weight_limit_max real NULL,
    weight_limit_min real NULL,
    bundle_first_type int NULL,
    bundle_flow_no int NULL,
    spray_year_count int NULL,
    label_count int NULL,
    length_limit_max real NULL,
    length_limit_min real NULL,
    label_length_type int NULL,
    label_weight_type int NULL,
    label_type int NULL,
    tube_no int NULL,
    qrcode_spray_enable int NULL,
    weight_per_meter real NULL,
    weight_ew real NULL
);

-- 为各个字段添加注释
COMMENT ON COLUMN parameter_set.order_no IS '当前合同号';
COMMENT ON COLUMN parameter_set.item_no IS '当前项目号';
COMMENT ON COLUMN parameter_set.diameter IS '外径';
COMMENT ON COLUMN parameter_set.thickness IS '壁厚';
COMMENT ON COLUMN parameter_set.direction_code IS '去向';
COMMENT ON COLUMN parameter_set.bundle_type IS '管捆类型';
COMMENT ON COLUMN parameter_set.bundle_number IS '打捆根数';
COMMENT ON COLUMN parameter_set.produce_job_point IS '机组代码';
COMMENT ON COLUMN parameter_set.order_weight IS '订货总量';
COMMENT ON COLUMN parameter_set.lot_no IS '上料试批号';
COMMENT ON COLUMN parameter_set.roll_no IS '当前轧批号';
COMMENT ON COLUMN parameter_set.melt_no IS '上料炉号';
COMMENT ON COLUMN parameter_set.melt_no_coupling IS '接箍炉号';
COMMENT ON COLUMN parameter_set.lot_no_coupling IS '接箍批号';
COMMENT ON COLUMN parameter_set.flow_no IS '喷印工位下一根管子流水号';
COMMENT ON COLUMN parameter_set.feed_number IS '上料总根数';
COMMENT ON COLUMN parameter_set.length_coupling IS '保护环长度';
COMMENT ON COLUMN parameter_set.weight_coupling IS '保护环重量';
COMMENT ON COLUMN parameter_set.weight_packging IS '包装材料重量';
COMMENT ON COLUMN parameter_set.length_enable IS '测长允许';
COMMENT ON COLUMN parameter_set.weight_enable IS '称重允许';
COMMENT ON COLUMN parameter_set.circle_enable IS '色环允许';
COMMENT ON COLUMN parameter_set.carve_enable IS '针刻印允许';
COMMENT ON COLUMN parameter_set.spray_enable IS '喷印允许';
COMMENT ON COLUMN parameter_set.waste_length_enable IS '长度判废';
COMMENT ON COLUMN parameter_set.waste_weight_enable IS '重量判废';
COMMENT ON COLUMN parameter_set.gun1 IS '色环喷枪1';
COMMENT ON COLUMN parameter_set.gun2 IS '色环喷枪2';
COMMENT ON COLUMN parameter_set.gun3 IS '色环喷枪3';
COMMENT ON COLUMN parameter_set.gun4 IS '色环喷枪4';
COMMENT ON COLUMN parameter_set.gun5 IS '色环喷枪5';
COMMENT ON COLUMN parameter_set.gun_clear IS '喷枪清洗';
COMMENT ON COLUMN parameter_set.circle_time IS '色环时间';
COMMENT ON COLUMN parameter_set.spray_length_type IS '喷涂长度格式';
COMMENT ON COLUMN parameter_set.spray_weight_type IS '喷涂重量格式';
COMMENT ON COLUMN parameter_set.spray_length_precision IS '喷涂长度小数位数';
COMMENT ON COLUMN parameter_set.spray_weight_precision IS '喷涂重量小数位数';
COMMENT ON COLUMN parameter_set.weight_limit_max IS '管重偏差上限';
COMMENT ON COLUMN parameter_set.weight_limit_min IS '管重偏差下限';
COMMENT ON COLUMN parameter_set.bundle_first_type IS '管捆号首位';
COMMENT ON COLUMN parameter_set.bundle_flow_no IS '管捆流水号';
COMMENT ON COLUMN parameter_set.spray_year_count IS '喷印刻印<年>';
COMMENT ON COLUMN parameter_set.label_count IS '管捆标签张数';
COMMENT ON COLUMN parameter_set.length_limit_max IS '判废管长止';
COMMENT ON COLUMN parameter_set.length_limit_min IS '判废管长起';
COMMENT ON COLUMN parameter_set.label_length_type IS '标签长度格式';
COMMENT ON COLUMN parameter_set.label_weight_type IS '标签重量格式';
COMMENT ON COLUMN parameter_set.label_type IS '标签格式';
COMMENT ON COLUMN parameter_set.tube_no IS '测长工位下一根管号';
COMMENT ON COLUMN parameter_set.qrcode_spray_enable IS '二维码喷印';
COMMENT ON COLUMN parameter_set.weight_per_meter IS '米重';
COMMENT ON COLUMN parameter_set.weight_ew IS 'EW值';

```
