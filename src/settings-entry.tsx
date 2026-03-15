import { render } from 'solid-js/web';

async function main() {
  const { loadFullConfig, migrateFromLocalStorage } = await import('~/lib/config-persistence');
  const config = await loadFullConfig();

  await migrateFromLocalStorage(config);

  const { initLocaleFromConfig } = await import('~/lib/i18n');
  const { initSettingsFromConfig } = await import('~/stores/settings');
  const { initLayoutFromConfig } = await import('~/stores/layout');

  initLocaleFromConfig(config);
  initSettingsFromConfig(config);
  initLayoutFromConfig(config);

  const { SettingsApp } = await import('~/components/settings/SettingsApp');
  render(() => <SettingsApp />, document.getElementById('root')!);
}

main();
