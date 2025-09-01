/** @jsxImportSource preact */

import { useState, useEffect } from 'preact/hooks';
import type { Domain, PluginConfig } from './types';
import { generateId, isValidUrl, getPluginConfig, savePluginConfig, ensureProtocol, getI18nText } from './utils';

/**
 * 设置面板组件
 * 管理自定义域名的添加、编辑、删除和默认域名设置
 */
export function Setting() {
  const [config, setConfig] = useState<PluginConfig>({ domains: [], defaultDomainId: null });
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const pluginConfig = await getPluginConfig();
      setConfig(pluginConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
      window.Blinko.toast.error(getI18nText('messages.loadConfigFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await savePluginConfig(config);
      window.Blinko.toast.success(getI18nText('messages.settingsSaved'));
      window.Blinko.closeDialog();
    } catch (error) {
      console.error('Failed to save config:', error);
      window.Blinko.toast.error(getI18nText('messages.saveConfigFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = () => {
    setIsAddingNew(true);
    setEditingDomain(null);
    setFormData({ name: '', url: '' });
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setIsAddingNew(false);
    setFormData({ name: domain.name, url: domain.url });
  };

  const handleDeleteDomain = (domainId: string) => {
    const newDomains = config.domains.filter(d => d.id !== domainId);
    const newDefaultId = config.defaultDomainId === domainId ? null : config.defaultDomainId;
    setConfig({ ...config, domains: newDomains, defaultDomainId: newDefaultId });
  };

  const handleToggleDomain = (domainId: string) => {
    const newDomains = config.domains.map(d => 
      d.id === domainId ? { ...d, enabled: !d.enabled } : d
    );
    setConfig({ ...config, domains: newDomains });
  };

  const handleSetDefault = (domainId: string | null) => {
    setConfig({ ...config, defaultDomainId: domainId });
  };

  const handleSubmitForm = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      window.Blinko.toast.error(getI18nText('messages.fillCompleteInfo'));
      return;
    }

    const protocolUrl = ensureProtocol(formData.url.trim());
    if (!isValidUrl(protocolUrl)) {
      window.Blinko.toast.error(getI18nText('messages.invalidUrl'));
      return;
    }

    if (isAddingNew) {
      const newDomain: Domain = {
        id: generateId(),
        name: formData.name.trim(),
        url: protocolUrl,
        enabled: true
      };
      setConfig({ ...config, domains: [...config.domains, newDomain] });
    } else if (editingDomain) {
      const newDomains = config.domains.map(d => 
        d.id === editingDomain.id 
          ? { ...d, name: formData.name.trim(), url: protocolUrl }
          : d
      );
      setConfig({ ...config, domains: newDomains });
    }

    setIsAddingNew(false);
    setEditingDomain(null);
    setFormData({ name: '', url: '' });
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingDomain(null);
    setFormData({ name: '', url: '' });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* 标题 */}
      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
          {getI18nText('settings.title')}
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          {getI18nText('settings.description')}
        </p>
      </div>

      {/* 域名列表 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0' }}>
            {getI18nText('settings.domainList')}
          </h3>
          <button
            onClick={handleAddDomain}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            disabled={isAddingNew || editingDomain !== null}
            onMouseOver={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseOut={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {getI18nText('settings.addDomain')}
          </button>
        </div>

        {/* 添加/编辑表单 */}
        {(isAddingNew || editingDomain) && (
          <div style={{
            padding: '16px',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            marginBottom: '16px'
          }}>
            <h4 style={{ fontWeight: '500', color: '#111827', margin: '0 0 12px 0' }}>
              {isAddingNew ? getI18nText('settings.addNewDomain') : getI18nText('settings.editDomain')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  {getI18nText('settings.domainName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                  placeholder={getI18nText('settings.domainNamePlaceholder')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  {getI18nText('settings.domainUrl')}
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.currentTarget.value })}
                  placeholder={getI18nText('settings.domainUrlPlaceholder')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  � 如果不包含协议换，将自动添加 https://
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSubmitForm}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isAddingNew ? getI18nText('settings.save') : getI18nText('settings.save')}
                </button>
                <button
                  onClick={handleCancelForm}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#d1d5db',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {getI18nText('settings.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 域名列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {config.domains.map((domain) => (
            <div
              key={domain.id}
              style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{domain.name}</span>
                    {config.defaultDomainId === domain.id && (
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '12px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        borderRadius: '12px'
                      }}>
                        {getI18nText('settings.default')}
                      </span>
                    )}
                    <span style={{
                      padding: '2px 8px',
                      fontSize: '12px',
                      backgroundColor: domain.enabled ? '#dcfce7' : '#f3f4f6',
                      color: domain.enabled ? '#166534' : '#6b7280',
                      borderRadius: '12px'
                    }}>
                      {domain.enabled ? getI18nText('settings.enabled') : getI18nText('settings.disabled')}
                    </span>
                    {domain.url.startsWith('https://') && (
                      <span style={{
                        padding: '2px 8px',
                        fontSize: '12px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '12px'
                      }}>
                        🛡️ HTTPS
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{domain.url}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleDomain(domain.id)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      backgroundColor: domain.enabled ? '#fef3c7' : '#dcfce7',
                      color: domain.enabled ? '#92400e' : '#166534',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {domain.enabled ? getI18nText('settings.disable') : getI18nText('settings.enable')}
                  </button>
                  <button
                    onClick={() => handleEditDomain(domain)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    disabled={isAddingNew || editingDomain !== null}
                  >
                    {getI18nText('settings.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    disabled={isAddingNew || editingDomain !== null}
                  >
                    {getI18nText('settings.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {config.domains.length === 0 && !isAddingNew && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
            <p style={{ margin: '0 0 4px 0' }}>{getI18nText('settings.noDomains')}</p>
            <p style={{ fontSize: '14px', margin: '0' }}>{getI18nText('settings.addDomainHint')}</p>
          </div>
        )}
      </div>

      {/* 默认域名设置 */}
      {config.domains.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0 0 16px 0' }}>
            {getI18nText('settings.defaultDomainSettings')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="defaultDomain"
                checked={config.defaultDomainId === null}
                onChange={() => handleSetDefault(null)}
                style={{ accentColor: '#2563eb' }}
              />
              <span style={{ color: '#374151' }}>{getI18nText('settings.useOriginalLink')}</span>
            </label>
            {config.domains.filter(d => d.enabled).map((domain) => (
              <label key={domain.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="defaultDomain"
                  checked={config.defaultDomainId === domain.id}
                  onChange={() => handleSetDefault(domain.id)}
                  style={{ accentColor: '#2563eb' }}
                />
                <span style={{ color: '#374151' }}>{domain.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 保存按钮 */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={handleSave}
          disabled={saving || isAddingNew || editingDomain !== null}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: saving || isAddingNew || editingDomain !== null ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: saving || isAddingNew || editingDomain !== null ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          {saving ? getI18nText('settings.saving') : getI18nText('settings.saveSettings')}
        </button>
      </div>
    </div>
  );
}

