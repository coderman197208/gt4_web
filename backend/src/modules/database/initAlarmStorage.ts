import { bootstrapAlarmStorage } from './alarmStorage.js';
import prisma from './prismaClient.js';

async function main() {
  await bootstrapAlarmStorage();
  console.info('[AlarmStorage] Alarm schema and seed data are ready');
}

main()
  .catch((error) => {
    console.error('[AlarmStorage] Failed to initialize alarm storage', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
