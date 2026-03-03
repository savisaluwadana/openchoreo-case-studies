from django.db import models
import uuid

class Course(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code        = models.CharField(max_length=32, unique=True)
    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructor  = models.CharField(max_length=255, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'courses'

class Student(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_id = models.CharField(max_length=64, unique=True)
    first_name = models.CharField(max_length=128)
    last_name  = models.CharField(max_length=128)
    email      = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'students'

class Enrollment(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course     = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student    = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    grade      = models.CharField(max_length=4, blank=True, null=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ('course', 'student')
