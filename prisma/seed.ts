import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { name: "SIVILIE HIGH SCHOOL" },
    update: {},
    create: { name: "SIVILIE HIGH SCHOOL" },
  });

  const student = await prisma.student.upsert({
    where: { admission: "SIV001" },
    update: {},
    create: {
      name: "Alice Mwangi",
      admission: "SIV001",
      schoolId: school.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "teacher@sivilie.edu" },
    update: {},
    create: {
      email: "teacher@sivilie.edu",
      name: "Mr Teacher",
      role: "TEACHER",
      schoolId: school.id,
    },
  });

  // sample grade
  await prisma.grade.create({
    data: {
      studentId: student.id,
      subject: "Mathematics",
      term: "Term 1",
      score: 82,
      grade: "A-",
    },
  });

  // sample invoice
  await prisma.invoice.create({
    data: {
      studentId: student.id,
      description: "Term 1 Fees",
      amount: 1200,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
