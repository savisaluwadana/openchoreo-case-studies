from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Course, Student, Enrollment
from .serializers import CourseSerializer, StudentSerializer, EnrollmentSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('code')
    serializer_class = CourseSerializer

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """List all students enrolled in a course."""
        course = self.get_object()
        enrollments = Enrollment.objects.filter(course=course).select_related('student')
        data = StudentSerializer([e.student for e in enrollments], many=True).data
        return Response(data)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('last_name')
    serializer_class = StudentSerializer

    @action(detail=True, methods=['get'])
    def courses(self, request, pk=None):
        """List all courses a student is enrolled in."""
        student = self.get_object()
        enrollments = Enrollment.objects.filter(student=student).select_related('course')
        data = CourseSerializer([e.course for e in enrollments], many=True).data
        return Response(data)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().order_by('-enrolled_at')
    serializer_class = EnrollmentSerializer

    @action(detail=True, methods=['patch'])
    def grade(self, request, pk=None):
        """Update a student's grade for a course."""
        enrollment = self.get_object()
        g = request.data.get('grade')
        if not g:
            return Response({'error': 'grade is required'}, status=status.HTTP_400_BAD_REQUEST)
        enrollment.grade = g
        enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data)
