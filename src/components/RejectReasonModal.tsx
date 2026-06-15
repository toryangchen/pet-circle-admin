import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';

type RejectReasonModalProps = {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  title?: string;
  fieldLabel?: string;
  okText?: string;
  defaultReason?: string;
  placeholder?: string;
};

export function RejectReasonModal({
  open,
  loading,
  onCancel,
  onConfirm,
  title = '填写拒绝原因',
  fieldLabel = '拒绝原因',
  okText = '确认拒绝',
  defaultReason = '内容信息不足，建议补充后重新提交',
  placeholder = '例如：联系方式缺失、结构化字段不完整、标题与内容不符',
}: RejectReasonModalProps) {
  const [form] = Form.useForm<{ reason: string }>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ reason: defaultReason });
    }
  }, [defaultReason, form, open]);

  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      cancelText="取消"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        await onConfirm(values.reason.trim());
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={fieldLabel}
          name="reason"
          rules={[
            { required: true, message: `请填写${fieldLabel}` },
            { min: 4, message: `${fieldLabel}至少 4 个字` },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={placeholder}
            maxLength={120}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
