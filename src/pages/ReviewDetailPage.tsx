import { useEffect, useState } from 'react';
import { App, Button, Card, Col, Descriptions, Empty, Image, Row, Space, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { approveReview, fetchReviewDetail, offlineReview, rejectReview } from '../services/api';
import type { ReviewDetail } from '../services/types';

function renderStructuredFieldBlock(detail: ReviewDetail) {
  const data =
    detail.homeFeedingDetail ?? detail.boardingDetail ?? detail.adoptionDetail ?? detail.secondHandDetail;

  if (!data) {
    return '无结构化字段';
  }

  return (
    <Descriptions column={1} size="small">
      {Object.entries(data).map(([key, value]) => (
        <Descriptions.Item key={key} label={key}>
          {Array.isArray(value) ? value.join(' / ') : String(value)}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );
}

export function ReviewDetailPage() {
  const { postId = '' } = useParams();
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [offlineSubmitting, setOfflineSubmitting] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setErrorText('');
      try {
        const nextDetail = await fetchReviewDetail(postId);
        if (!cancelled) {
          setDetail(nextDetail);
        }
      } catch (error) {
        if (!cancelled) {
          setDetail(null);
          const nextError = error instanceof Error ? error.message : '审核详情加载失败';
          setErrorText(nextError);
          await message.error(nextError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [message, postId]);

  if (loading) {
    return <Card loading={loading} />;
  }

  if (!detail) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <div>
            <h1 className="page-title">审核详情</h1>
            <div className="page-subtitle">查看内容、结构化字段与发布者信息后再执行审核。</div>
          </div>
          <Button onClick={() => navigate(-1)}>返回列表</Button>
        </div>
        <Card>
          <Empty description={errorText || '未找到审核详情'} />
        </Card>
      </div>
    );
  }

  const canReview = detail.status === 'PENDING';
  const canOffline = detail.status === 'APPROVED';

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">审核详情</h1>
          <div className="page-subtitle">查看内容、结构化字段与发布者信息后再执行审核。</div>
        </div>
        <Space>
          <Button onClick={() => navigate(-1)}>返回列表</Button>
          {canReview ? (
            <>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    await approveReview(detail.id);
                    await message.success('审核已通过');
                    navigate('/reviews');
                  } catch (error) {
                    await message.error(error instanceof Error ? error.message : '审核通过失败');
                  }
                }}
              >
                审核通过
              </Button>
              <Button danger onClick={() => setRejectOpen(true)}>
                审核拒绝
              </Button>
            </>
          ) : null}
          {canOffline ? (
            <Button
              danger
              loading={offlineSubmitting}
              onClick={async () => {
                setOfflineSubmitting(true);
                try {
                  await offlineReview(detail.id, '内容过期或人工下架');
                  await message.success('已执行下架');
                  navigate('/online');
                } catch (error) {
                  await message.error(error instanceof Error ? error.message : '下架失败');
                } finally {
                  setOfflineSubmitting(false);
                }
              }}
            >
              手动下架
            </Button>
          ) : null}
        </Space>
      </div>
      <Row gutter={16}>
        <Col span={16}>
          <Card loading={loading} title="内容详情">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space>
                <Tag color={detail.type === 'SERVICE' ? 'green' : 'gold'}>{detail.type}</Tag>
                {detail.serviceCategory ? <Tag>{detail.serviceCategory}</Tag> : null}
                <Tag>{detail.status}</Tag>
              </Space>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{detail.title}</div>
              <div style={{ color: '#4b5563', lineHeight: 1.8 }}>{detail.content}</div>
              <Image.PreviewGroup>
                <Space wrap>
                  {detail.images.map((image) => (
                    <Image key={image} src={image} width={180} height={140} style={{ objectFit: 'cover' }} />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </Space>
          </Card>
          <Card title="结构化字段" style={{ marginTop: 16 }}>
            {renderStructuredFieldBlock(detail)}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="发布者信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="昵称">
                {detail.author?.id ? (
                  <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/users/${detail.author?.id}`)}>
                    {detail.author?.nickname || '未命名用户'}
                  </Button>
                ) : (
                  detail.author?.nickname || '未命名用户'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">{detail.author?.phone || '未绑定'}</Descriptions.Item>
              <Descriptions.Item label="城市">{detail.city}</Descriptions.Item>
              <Descriptions.Item label="联系姓名">{detail.contact?.contactName || '未填写'}</Descriptions.Item>
              <Descriptions.Item label="微信号">{detail.contact?.wechatId || '未填写'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="审核记录" style={{ marginTop: 16 }}>
            <Timeline
              items={(detail.reviewLogs.length ? detail.reviewLogs : [{ id: 'pending', action: 'PENDING', createdAt: detail.createdAt, reason: null }]).map((item) => ({
                children: (
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.action}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>
                      {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                    {item.reason ? <div style={{ marginTop: 4, color: '#4b5563' }}>{item.reason}</div> : null}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
      {canReview ? (
        <RejectReasonModal
          open={rejectOpen}
          loading={rejectSubmitting}
          onCancel={() => setRejectOpen(false)}
          onConfirm={async (reason) => {
            setRejectSubmitting(true);
            try {
              await rejectReview(detail.id, reason);
              await message.success('已拒绝');
              setRejectOpen(false);
              navigate('/reviews');
            } catch (error) {
              await message.error(error instanceof Error ? error.message : '拒绝失败');
            } finally {
              setRejectSubmitting(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
