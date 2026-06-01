import csv
from django.http import HttpResponse
from io import BytesIO
from reportlab.pdfgen import canvas

def export_leave_csv(queryset):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="leave_report.csv"'

    writer = csv.writer(response)
    writer.writerow(["Employee", "Leave Type", "Status", "Start Date", "End Date"])

    for leave in queryset:
        writer.writerow([
            leave.user.full_name,
            leave.leave_type,
            leave.status,
            leave.start_date,
            leave.end_date
        ])

    return response

def export_leave_pdf(queryset):
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="leave_report.pdf"'

    buffer = BytesIO()
    p = canvas.Canvas(buffer)

    y = 800
    p.setFont("Helvetica", 10)

    p.drawString(50, y, "Leave Report")
    y -= 30

    for leave in queryset:
        line = f"{leave.user.full_name} | {leave.leave_type} | {leave.status}"
        p.drawString(50, y, line)
        y -= 20

        if y < 50:
            p.showPage()
            y = 800

    p.save()
    pdf = buffer.getvalue()
    buffer.close()

    response.write(pdf)
    return response