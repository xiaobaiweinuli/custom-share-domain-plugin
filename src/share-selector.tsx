/** @jsxImportSource preact */

import { useState, useEffect, useRef } from 'preact/hooks';
import type { ShareOption } from './types';
import { getPluginConfig, getShareOptions, copyToClipboard, getI18nText, createOfficialShare, cancelShare } from './utils';

interface ShareSelectorProps {
  note: any;
  onClose: () => void;
}

/**
 * 分享选择器组件
 * 显示可用的分享域名选项，用户点击后复制对应的分享链接
 */
export function ShareSelector({ note, onClose }: ShareSelectorProps) {
  const [shareOptions, setShareOptions] = useState<ShareOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [usePassword, setUsePassword] = useState(false);
  const [passwordDigits, setPasswordDigits] = useState(['', '', '', '', '', '']);
  const dialogRef = useRef<HTMLDivElement>(null);
  const passwordInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    loadExistingShareInfo();
  }, [note]);

  // 处理密码数字输入
  const handlePasswordDigitChange = (index: number, value: string) => {
    // 只允许数字
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...passwordDigits];
    newDigits[index] = value;
    setPasswordDigits(newDigits);

    // 自动跳转到下一个输入框
    if (value && index < 5) {
      passwordInputRefs.current[index + 1]?.focus();
    }
  };

  // 处理退格键
  const handlePasswordKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !passwordDigits[index] && index > 0) {
      passwordInputRefs.current[index - 1]?.focus();
    }
  };

  // 生成随机6位数字密码
  const generateRandomPassword = () => {
    const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString());
    setPasswordDigits(digits);
  };

  // 加载现有的分享信息
  const loadExistingShareInfo = async () => {
    try {
      setLoading(true);
      
      // 首先尝试获取最新的note数据
      let latestNote = note;
      try {
        // 通过API获取最新的note数据
        const response = await window.Blinko.api.notes.list.mutate({
          isArchived: false,
          isRecycle: false,
          isShare: null,
          type: 0,
          tagId: null,
          withoutTag: false,
          withFile: false,
          withLink: false,
          isUseAiQuery: false,
          startDate: null,
          endDate: null,
          hasTodo: false,
          searchText: "",
          page: 1,
          size: 30
        });
        const notesList = response;
        
        // 找到对应的note
        const foundNote = notesList.find((n: any) => n.id === note.id);
        if (foundNote) {
          latestNote = foundNote;
          console.log('Found latest note data from API:', {
            noteId: latestNote.id,
            shareEncryptedUrl: latestNote.shareEncryptedUrl,
            sharePassword: latestNote.sharePassword,
            isShare: latestNote.isShare
          });
        }
      } catch (apiError) {
        console.log('Failed to fetch latest note data, using provided note:', apiError);
      }
      
      // 检查最新的note数据中的分享信息
      if (latestNote.isShare && latestNote.shareEncryptedUrl) {
        console.log('Found existing share in note:', {
          noteId: latestNote.id,
          shareEncryptedUrl: latestNote.shareEncryptedUrl,
          sharePassword: latestNote.sharePassword,
          isShare: latestNote.isShare
        });
        
        // 更新原始note对象
        note.isShare = latestNote.isShare;
        note.shareEncryptedUrl = latestNote.shareEncryptedUrl;
        note.sharePassword = latestNote.sharePassword;
        
        // 设置现有的密码状态
        if (latestNote.sharePassword && latestNote.sharePassword.length > 0) {
          setUsePassword(true);
          const digits = latestNote.sharePassword.padStart(6, '0').split('').slice(0, 6);
          setPasswordDigits(digits);
        } else {
          setUsePassword(false);
          setPasswordDigits(['', '', '', '', '', '']);
        }
        
        // 直接使用现有的分享信息生成选项
        await generateShareOptionsFromExisting();
      } else {
        console.log('No existing share found, showing settings interface');
        // 没有现有分享，重置状态并显示默认设置
        setUsePassword(false);
        setPasswordDigits(['', '', '', '', '', '']);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load existing share info:', error);
      setUsePassword(false);
      setPasswordDigits(['', '', '', '', '', '']);
      setLoading(false);
    }
  };

  // 基于现有分享信息生成选项
  const generateShareOptionsFromExisting = async () => {
    try {
      const config = await getPluginConfig();
      
      // 构建现有的分享链接 - 使用正确的分享ID
      let shareUrl = `${window.location.origin}/share/${note.shareEncryptedUrl}`;
      if (note.sharePassword) {
        shareUrl += `?password=${note.sharePassword}`;
      }
      
      console.log('Using existing share URL:', shareUrl);
      console.log('Note share info:', {
        id: note.id,
        shareEncryptedUrl: note.shareEncryptedUrl,
        sharePassword: note.sharePassword,
        isShare: note.isShare
      });
      
      // 基于现有分享链接生成自定义域名选项
      const options = getShareOptions(config.domains, shareUrl, config.defaultDomainId);
      setShareOptions(options);
    } catch (error) {
      console.error('Failed to generate options from existing share:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 生成分享链接
  const handleGenerateShare = () => {
    loadShareOptions();
  };

  // 取消分享
  const handleCancelShare = async () => {
    try {
      setLoading(true);
      
      const success = await cancelShare(note);
      
      if (success) {
        // 重置状态
        setShareOptions([]);
        setUsePassword(false);
        setPasswordDigits(['', '', '', '', '', '']);
        
        window.Blinko.toast.success(getI18nText('share.shareCanceled'));
        onClose();
      } else {
        window.Blinko.toast.error(getI18nText('share.cancelShareFailed'));
      }
    } catch (error) {
      console.error('Failed to cancel share:', error);
      window.Blinko.toast.error(getI18nText('share.cancelShareFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const loadShareOptions = async () => {
    try {
      setLoading(true);
      const config = await getPluginConfig();

      // 准备分享选项
      const password = usePassword ? passwordDigits.join('') : '';
      const shareOptions = {
        password: password,
        expireAt: null
      };

      // 首先创建官方分享链接
      const shareData = await createOfficialShare(note, shareOptions);
      console.log('Official share created:', shareData);

      if (!shareData || !shareData.url) {
        throw new Error('Failed to create official share');
      }

      // 基于官方分享链接生成自定义域名选项
      const options = getShareOptions(config.domains, shareData.url, config.defaultDomainId);
      setShareOptions(options);
      
      // 更新 note 对象的分享状态（用于下次打开时显示正确的状态）
      // shareData.id 是加密的分享ID，不是原始note ID
      note.isShare = true;
      note.shareEncryptedUrl = shareData.id;
      note.sharePassword = password;
      
      console.log('Updated note share state:', {
        noteId: note.id,
        shareEncryptedUrl: note.shareEncryptedUrl,
        sharePassword: note.sharePassword,
        isShare: note.isShare
      });
      
    } catch (error) {
      console.error('Failed to load share options:', error);
      window.Blinko.toast.error(getI18nText('messages.showShareSelectorFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (option: ShareOption) => {
    try {
      console.log('Attempting to copy:', option.url);

      // 尝试多种复制方法
      let success = false;

      // 方法1: 使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(option.url);
          success = true;
          console.log('Copy successful with Clipboard API');
        } catch (clipboardError) {
          console.log('Clipboard API failed:', clipboardError);
        }
      }

      // 方法2: 使用传统方法
      if (!success) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = option.url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          success = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (success) {
            console.log('Copy successful with execCommand');
          }
        } catch (execError) {
          console.log('execCommand failed:', execError);
        }
      }

      if (success) {
        window.Blinko.toast.success(getI18nText('share.linkCopied', { domainName: option.name }));
        onClose();
      } else {
        console.log('All copy methods failed');
        // 创建一个临时的输入框让用户手动复制
        const tempInput = document.createElement('input');
        tempInput.value = option.url;
        tempInput.style.position = 'fixed';
        tempInput.style.top = '50%';
        tempInput.style.left = '50%';
        tempInput.style.transform = 'translate(-50%, -50%)';
        tempInput.style.zIndex = '10000';
        tempInput.style.padding = '10px';
        tempInput.style.border = '2px solid #2563eb';
        tempInput.style.borderRadius = '6px';
        tempInput.style.fontSize = '14px';
        document.body.appendChild(tempInput);
        tempInput.select();

        window.Blinko.toast.error('自动复制失败，请手动复制链接');

        // 3秒后移除输入框
        setTimeout(() => {
          if (document.body.contains(tempInput)) {
            document.body.removeChild(tempInput);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.Blinko.toast.error(`${getI18nText('share.copyFailed')}: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div
        ref={dialogRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '95%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb'
        }}
      >
        <div style={{ textAlign: 'center' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div
      ref={dialogRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '95%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>
          {getI18nText('share.selectDomain')}
        </h3>
        <button
          onClick={onClose}
          style={{
            color: '#9ca3af',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#6b7280';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 分享设置 */}
      <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>访问密码</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>保护您分享的内容</span>
          </div>
          <div
            onClick={() => setUsePassword(!usePassword)}
            style={{
              width: '44px',
              height: '24px',
              backgroundColor: usePassword ? '#2563eb' : '#d1d5db',
              borderRadius: '12px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: usePassword ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
        </div>

        {usePassword && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
              {passwordDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { passwordInputRefs.current[index] = el; }}
                  type="text"
                  value={digit}
                  onChange={(e) => handlePasswordDigitChange(index, e.currentTarget.value)}
                  onKeyDown={(e) => handlePasswordKeyDown(index, e)}
                  maxLength={1}
                  style={{
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '600',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <button
                onClick={generateRandomPassword}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#2563eb',
                  backgroundColor: 'transparent',
                  border: '1px solid #2563eb',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                随机生成
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateShare}
          disabled={loading || (usePassword && passwordDigits.some(d => !d))}
          style={{
            width: '100%',
            padding: '8px 16px',
            backgroundColor: (loading || (usePassword && passwordDigits.some(d => !d))) ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: (loading || (usePassword && passwordDigits.some(d => !d))) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '生成中...' : (shareOptions.length > 0 ? '重新生成分享链接' : '生成分享链接')}
        </button>
      </div>

      {shareOptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
          <p style={{ margin: '0 0 4px 0' }}>{getI18nText('share.noAvailableDomains')}</p>
          <p style={{ fontSize: '14px', margin: '0' }}>{getI18nText('share.addDomainsHint')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
            {getI18nText('share.clickToCopy')}
          </p>
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              style={{
                width: '100%',
                padding: '12px',
                textAlign: 'left',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{option.name}</span>
                    {option.isDefault && (
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '11px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        borderRadius: '10px',
                        whiteSpace: 'nowrap'
                      }}>
                        {getI18nText('settings.default')}
                      </span>
                    )}
                    {option.url.startsWith('https://') && (
                      <span style={{
                        padding: '2px 6px',
                        fontSize: '11px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '10px',
                        whiteSpace: 'nowrap'
                      }}>
                        🛡️ HTTPS
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    wordBreak: 'break-all',
                    lineHeight: '1.4',
                    maxHeight: '2.8em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {option.url}
                  </div>
                </div>
                <div style={{ color: '#9ca3af', flexShrink: 0, marginTop: '2px' }}>
                  <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
          
          {/* 取消分享按钮 */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handleCancelShare}
              disabled={loading}
              style={{
                width: '100%',
                padding: '8px 16px',
                backgroundColor: loading ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }
              }}
            >
              {loading ? getI18nText('share.cancelingShare') : getI18nText('share.cancelShare')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

