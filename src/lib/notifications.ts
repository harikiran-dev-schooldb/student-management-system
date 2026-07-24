import prisma from "@/lib/prisma";
import { getMessaging } from "@/lib/firebase-admin";

const FCM_BATCH_SIZE = 500;

type PushResult = {
  attempted: number;
  sent: number;
  failed: number;
};

function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

/**
 * Sends a push notification to the devices owned by the supplied students.
 * DeviceToken.userId stores a Clerk user ID, while notifications are usually
 * raised from a Student record, so this resolves both supported student links.
 */
export async function notifyStudents({
  schoolId,
  studentIds,
  title,
  body,
}: {
  schoolId: string;
  studentIds: string[];
  title: string;
  body: string;
}): Promise<PushResult> {
  const uniqueStudentIds = [...new Set(studentIds)];
  if (!uniqueStudentIds.length) return { attempted: 0, sent: 0, failed: 0 };

  try {
    const students = await prisma.student.findMany({
      where: { id: { in: uniqueStudentIds }, schoolId },
      select: {
        clerk_id: true,
        linkedUser: { select: { profile: { select: { clerk_id: true } } } },
      },
    });

    const userIds = [
      ...new Set(
        students
          .flatMap((student) => [
            student.clerk_id,
            student.linkedUser?.profile.clerk_id,
          ])
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (!userIds.length) return { attempted: 0, sent: 0, failed: 0 };

    const devices = await prisma.deviceToken.findMany({
      where: { schoolId, userId: { in: userIds } },
      select: { token: true },
    });

    const tokens = [...new Set(devices.map((device) => device.token))];
    if (!tokens.length) return { attempted: 0, sent: 0, failed: 0 };

    const messaging = getMessaging();
    let sent = 0;
    let failed = 0;
    const invalidTokens: string[] = [];

    for (const tokenBatch of chunks(tokens, FCM_BATCH_SIZE)) {
      const response = await messaging.sendEachForMulticast({
        tokens: tokenBatch,
        notification: { title, body },
      });

      sent += response.successCount;
      failed += response.failureCount;

      response.responses.forEach((result, index) => {
        const code = result.error?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(tokenBatch[index]);
        }
      });
    }

    if (invalidTokens.length) {
      await prisma.deviceToken.deleteMany({
        where: { token: { in: invalidTokens } },
      });
    }

    return { attempted: tokens.length, sent, failed };
  } catch (error) {
    // Notifications must never undo attendance or payment records.
    console.error("Push notification delivery failed", error);
    return { attempted: 0, sent: 0, failed: 0 };
  }
}
