// Importación de módulos necesarios
const express = require('express');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const dotenv = require('dotenv');
dotenv.config();

// Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false
  })
);

// Configuración del cliente OAuth2 para Google
let oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/auth/google/callback'
);

// Middleware para cargar tokens desde la sesión
app.use((req, res, next) => {
  if (req.session.tokens) {
    oAuth2Client.setCredentials(req.session.tokens);
  }
  next();
});

// Inicialización de APIs de Google
const classroom = google.classroom({ version: 'v1', auth: oAuth2Client });
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Ruta para iniciar el proceso de autenticación con Google
app.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      // Scopes necesarios para acceder a las APIs de Google
      'https://www.googleapis.com/auth/classroom.courses',
      'https://www.googleapis.com/auth/classroom.announcements',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.coursework.me',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/classroom.profile.emails',
      'https://www.googleapis.com/auth/classroom.profile.photos',
      'https://www.googleapis.com/auth/classroom.rosters',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });
  res.redirect(url);
});

// Callback para manejar la respuesta de autenticación de Google
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.redirect('http://localhost:3000/dashboard');
  } catch (error) {
    console.error('Auth failed:', error);
    res.redirect('http://localhost:3000/login?error=auth_failed');
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.redirect('http://localhost:3000/login');
  });
});

// Middleware para proteger rutas que requieren autenticación
app.use((req, res, next) => {
  if (!req.session.tokens) {
    return res.status(401).json({
      error: 'Not authenticated',
      redirect: '/auth/google'
    });
  }
  next();
});

// Ruta para obtener la lista de cursos
app.get('/api/courses', async (req, res) => {
  try {
    const [teacherCourses, studentCourses] = await Promise.all([
      classroom.courses.list({ teacherId: 'me', pageSize: 10 }),
      classroom.courses.list({ studentId: 'me', pageSize: 10 })
    ]);

    // Combinar y filtrar cursos duplicados
    const courses = [
      ...(teacherCourses.data.courses || []),
      ...(studentCourses.data.courses || [])
    ].filter((course, index, self) =>
      index === self.findIndex((c) => c.id === course.id)
    );

    // Formatear la información de los cursos
    const formattedCourses = await Promise.all(courses.map(async (course) => {
      try {
        const teachers = await classroom.courses.teachers.list({ courseId: course.id });
        const teacher = teachers.data.teachers?.[0];

        return {
          id: course.id,
          name: course.name,
          section: course.section,
          description: course.description,
          room: course.room,
          teacher: teacher ? teacher.profile.name.fullName : 'Not assigned',
          teacherPhoto: teacher?.profile?.photoUrl,
          alternateLink: course.alternateLink
        };
      } catch {
        return {
          id: course.id,
          name: course.name,
          section: course.section,
          description: course.description,
          room: course.room,
          teacher: 'Not assigned',
          alternateLink: course.alternateLink
        };
      }
    }));

    res.json(formattedCourses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const [courseResponse, teachersResponse, studentsResponse] = await Promise.all([
      classroom.courses.get({ id: courseId }),
      classroom.courses.teachers.list({ courseId }),
      classroom.courses.students.list({ courseId })
    ]);

    res.json({
      ...courseResponse.data,
      teachers: teachersResponse.data.teachers || [],
      students: studentsResponse.data.students || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

app.get('/api/userProfiles/:userId', async (req, res) => {
  try {
    const profile = await classroom.userProfiles.get({ userId: req.params.userId });
    res.json({
      name: profile.data.name?.fullName || 'Unknown User',
      email: profile.data.emailAddress || 'No email available'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.get('/api/courses/:courseId/announcements', async (req, res) => {
  try {
    const announcements = await classroom.courses.announcements.list({
      courseId: req.params.courseId,
      pageSize: 10
    });
    res.json({ announcements: announcements.data.announcements || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.get('/api/courses/:courseId/courseWork', async (req, res) => {
  try {
    const courseWork = await classroom.courses.courseWork.list({
      courseId: req.params.courseId,
      pageSize: 10
    });
    res.json({ courseWork: courseWork.data.courseWork || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course work' });
  }
});

app.get('/api/courses/:courseId/courseWork/:taskId', async (req, res) => {
  try {
    const { courseId, taskId } = req.params;
    const task = await classroom.courses.courseWork.get({
      courseId,
      id: taskId
    });
    res.json(task.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.get('/api/courses/:courseId/courseWork/:taskId/submission', async (req, res) => {
  try {
    const { courseId, taskId } = req.params;
    const submissions = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId: taskId,
      userId: 'me'
    });

    const submission = submissions.data.studentSubmissions?.[0];
    if (!submission) {
      return res.status(404).json({ error: 'No submission found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

app.post('/api/submissions', upload.single('file'), async (req, res) => {
  try {
    const { courseId, taskId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: ['root']
      },
      media: {
        mimeType: file.mimetype,
        body: require('stream').Readable.from(file.buffer)
      },
      fields: 'id'
    });

    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const submissions = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId: taskId,
      userId: 'me'
    });

    const studentSubmissionId = submissions.data.studentSubmissions?.[0]?.id;
    if (!studentSubmissionId) throw new Error('Student submission not found');

    await classroom.courses.courseWork.studentSubmissions.modifyAttachments({
      courseId,
      courseWorkId: taskId,
      id: studentSubmissionId,
      requestBody: {
        addAttachments: [
          {
            driveFile: {
              id: driveResponse.data.id
            }
          }
        ]
      }
    });

    res.json({
      message: 'File uploaded and attached successfully',
      fileId: driveResponse.data.id,
      studentSubmissionId
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
