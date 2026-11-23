#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/12f158b88dcfdbc46ba18e41274fded19b1e030ffce88cdf1a4d90aea446b0dd/contract';
import endContract from '../../snapshots/12f158b88dcfdbc46ba18e41274fded19b1e030ffce88cdf1a4d90aea446b0dd/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'inventory_adjustments_reason',
        members: ['stok_opname', 'damage', 'waste', 'manual_correction'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'notifications_category',
        members: ['purchase', 'product', 'promotion', 'system', 'inventory', 'shift'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'notifications_type',
        members: ['info', 'success', 'warning', 'error'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'offline_queue_status',
        members: ['pending', 'synced', 'failed'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'refunds_status',
        members: ['pending', 'approved', 'rejected'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'shifts_status',
        members: ['open', 'closed', 'verified'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'transactions_payment_method',
        members: ['saldo', 'qris', 'cash', 'transfer'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'transactions_status',
        members: ['pending', 'selesai', 'batal', 'menunggu', 'siap'],
      }),
      this.createTable({
        schema: 'public',
        table: 'audit_logs',
        columns: [
          col('action', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('after_values', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
          col('before_values', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('ip_address', 'character varying(45)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 45 } },
          }),
          col('model_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('model_type', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('user_id', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'cache',
        columns: [
          col('expiration', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('key', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['key'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'cache_locks',
        columns: [
          col('expiration', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('key', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('owner', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['key'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'failed_jobs',
        columns: [
          col('connection', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('exception', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('failed_at', 'timestamp(0)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('payload', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('queue', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('uuid', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'inventory_adjustments',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('difference', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('product_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('quantity_after', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity_before', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('reason', '"inventory_adjustments_reason"', {
            notNull: true,
            codecRef: {
              codecId: 'pg/enum@1',
              typeParams: { typeName: 'inventory_adjustments_reason' },
            },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('verified_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('verified_by', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'inventory_alerts',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('critical_threshold', 'int4', {
            notNull: true,
            default: lit(5),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('last_alert_sent_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('low_stock_threshold', 'int4', {
            notNull: true,
            default: lit(10),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('product_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('reorder_quantity', 'int4', {
            notNull: true,
            default: lit(20),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'job_batches',
        columns: [
          col('cancelled_at', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('failed_job_ids', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('failed_jobs', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('finished_at', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('name', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('options', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('pending_jobs', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('total_jobs', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'jobs',
        columns: [
          col('attempts', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('available_at', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('payload', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('queue', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('reserved_at', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'migrations',
        columns: [
          col('batch', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('migration', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'notifications',
        columns: [
          col('category', '"notifications_category"', {
            notNull: true,
            default: lit('system'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'notifications_category' } },
          }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('data', 'jsonb', { codecRef: { codecId: 'pg/jsonb@1' } }),
          col('icon', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('is_pinned', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('read_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('title', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('type', '"notifications_type"', {
            notNull: true,
            default: lit('info'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'notifications_type' } },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('user_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'offline_queue',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('error_message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kasir_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('retry_count', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('status', '"offline_queue_status"', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'offline_queue_status' } },
          }),
          col('synced_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('transaction_data', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'password_reset_tokens',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('email', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('token', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['email'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'products',
        columns: [
          col('category', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('deleted_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('image', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('name', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('price', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('stock', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'refunds',
        columns: [
          col('amount', 'numeric(10,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('approved_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('approved_by', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('reason', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('requested_by', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('status', '"refunds_status"', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'refunds_status' } },
          }),
          col('transaction_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'sale_template_items',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('product_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('quantity', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('template_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'sale_templates',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('kasir_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('name', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('usage_count', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'sessions',
        columns: [
          col('id', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('ip_address', 'character varying(45)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 45 } },
          }),
          col('last_activity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('payload', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_agent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'shifts',
        columns: [
          col('actual_cash', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('closed_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('closing_balance', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('discrepancy', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('expected_cash', 'numeric(10,2)', {
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('kasir_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('opened_at', 'timestamp(0)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('opening_balance', 'numeric(10,2)', {
            notNull: true,
            default: lit('0.00'),
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 10, scale: 2 } },
          }),
          col('status', '"shifts_status"', {
            notNull: true,
            default: lit('open'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'shifts_status' } },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'topups',
        columns: [
          col('amount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('user_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'transaction_items',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('price', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('product_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('subtotal', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('transaction_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'transactions',
        columns: [
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('customer_name', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('notified_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('payment_method', '"transactions_payment_method"', {
            notNull: true,
            default: lit('saldo'),
            codecRef: {
              codecId: 'pg/enum@1',
              typeParams: { typeName: 'transactions_payment_method' },
            },
          }),
          col('picked_up_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('pickup_code', 'character varying(8)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 8 } },
          }),
          col('ready_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('shift_id', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
          col('status', '"transactions_status"', {
            notNull: true,
            default: lit('selesai'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'transactions_status' } },
          }),
          col('total_price', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('user_id', 'int8', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('avatar', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('created_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('email', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('email_verified_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
          col('google_id', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'BIGSERIAL', { notNull: true, codecRef: { codecId: 'pg/int8@1' } }),
          col('name', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('password', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('remember_token', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('role', 'character varying(255)', {
            notNull: true,
            default: lit('user'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('updated_at', 'timestamp(0)', {
            codecRef: { codecId: 'pg/timestamp-date@1', typeParams: { precision: 0 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'audit_logs',
        index: 'audit_logs_model_type_model_id_index',
        columns: ['model_type', 'model_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'audit_logs',
        index: 'audit_logs_user_id_created_at_index',
        columns: ['user_id', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'failed_jobs',
        index: 'failed_jobs_uuid_unique',
        columns: ['uuid'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory_adjustments',
        index: 'inventory_adjustments_created_at_index',
        columns: ['created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory_adjustments',
        index: 'inventory_adjustments_product_id_reason_index',
        columns: ['product_id', 'reason'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory_adjustments',
        index: 'inventory_adjustments_verified_by_idx',
        columns: ['verified_by'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory_alerts',
        index: 'inventory_alerts_is_active_index',
        columns: ['is_active'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory_alerts',
        index: 'inventory_alerts_product_id_unique',
        columns: ['product_id'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'jobs',
        index: 'jobs_queue_index',
        columns: ['queue'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_category_index',
        columns: ['category'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_read_at_index',
        columns: ['read_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_user_id_index',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_user_id_is_pinned_created_at_index',
        columns: ['user_id', 'is_pinned', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'offline_queue',
        index: 'offline_queue_kasir_id_index',
        columns: ['kasir_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'offline_queue',
        index: 'offline_queue_kasir_id_status_index',
        columns: ['kasir_id', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'offline_queue',
        index: 'offline_queue_status_index',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'products',
        index: 'products_category_index',
        columns: ['category'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'products',
        index: 'products_stock_index',
        columns: ['stock'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'refunds',
        index: 'refunds_approved_by_idx',
        columns: ['approved_by'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'refunds',
        index: 'refunds_requested_by_created_at_index',
        columns: ['requested_by', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'refunds',
        index: 'refunds_transaction_id_status_index',
        columns: ['transaction_id', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale_template_items',
        index: 'sale_template_items_product_id_idx',
        columns: ['product_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale_template_items',
        index: 'sale_template_items_template_id_idx',
        columns: ['template_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale_templates',
        index: 'sale_templates_kasir_id_index',
        columns: ['kasir_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale_templates',
        index: 'sale_templates_kasir_id_is_active_index',
        columns: ['kasir_id', 'is_active'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sessions',
        index: 'sessions_last_activity_index',
        columns: ['last_activity'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sessions',
        index: 'sessions_user_id_index',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_kasir_id_closed_at_index',
        columns: ['kasir_id', 'closed_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_kasir_id_status_index',
        columns: ['kasir_id', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'shifts',
        index: 'shifts_opened_at_closed_at_index',
        columns: ['opened_at', 'closed_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'topups',
        index: 'topups_user_id_idx',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transaction_items',
        index: 'transaction_items_product_id_index',
        columns: ['product_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transaction_items',
        index: 'transaction_items_transaction_id_idx',
        columns: ['transaction_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transactions',
        index: 'transactions_pickup_code_index',
        columns: ['pickup_code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transactions',
        index: 'transactions_shift_id_idx',
        columns: ['shift_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transactions',
        index: 'transactions_status_created_at_index',
        columns: ['status', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'transactions',
        index: 'transactions_user_id_status_index',
        columns: ['user_id', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_email_unique',
        columns: ['email'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_google_id_index',
        columns: ['google_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_role_index',
        columns: ['role'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'audit_logs',
        foreignKey: {
          name: 'audit_logs_user_id_foreign',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventory_adjustments',
        foreignKey: {
          name: 'inventory_adjustments_product_id_foreign',
          columns: ['product_id'],
          references: { schema: 'public', table: 'products', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventory_adjustments',
        foreignKey: {
          name: 'inventory_adjustments_verified_by_foreign',
          columns: ['verified_by'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventory_alerts',
        foreignKey: {
          name: 'inventory_alerts_product_id_foreign',
          columns: ['product_id'],
          references: { schema: 'public', table: 'products', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'notifications',
        foreignKey: {
          name: 'notifications_user_id_foreign',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'offline_queue',
        foreignKey: {
          name: 'offline_queue_kasir_id_foreign',
          columns: ['kasir_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'refunds',
        foreignKey: {
          name: 'refunds_approved_by_foreign',
          columns: ['approved_by'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'refunds',
        foreignKey: {
          name: 'refunds_requested_by_foreign',
          columns: ['requested_by'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'refunds',
        foreignKey: {
          name: 'refunds_transaction_id_foreign',
          columns: ['transaction_id'],
          references: { schema: 'public', table: 'transactions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale_template_items',
        foreignKey: {
          name: 'sale_template_items_product_id_foreign',
          columns: ['product_id'],
          references: { schema: 'public', table: 'products', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale_template_items',
        foreignKey: {
          name: 'sale_template_items_template_id_foreign',
          columns: ['template_id'],
          references: { schema: 'public', table: 'sale_templates', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale_templates',
        foreignKey: {
          name: 'sale_templates_kasir_id_foreign',
          columns: ['kasir_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'shifts',
        foreignKey: {
          name: 'shifts_kasir_id_foreign',
          columns: ['kasir_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'topups',
        foreignKey: {
          name: 'topups_user_id_foreign',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'transaction_items',
        foreignKey: {
          name: 'transaction_items_product_id_foreign',
          columns: ['product_id'],
          references: { schema: 'public', table: 'products', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'transaction_items',
        foreignKey: {
          name: 'transaction_items_transaction_id_foreign',
          columns: ['transaction_id'],
          references: { schema: 'public', table: 'transactions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'transactions',
        foreignKey: {
          name: 'transactions_shift_id_foreign',
          columns: ['shift_id'],
          references: { schema: 'public', table: 'shifts', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'transactions',
        foreignKey: {
          name: 'transactions_user_id_foreign',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
