package kr.hi.travel_community.service;

import kr.hi.travel_community.entity.InquiryBox;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.repository.InquiryRepository;
import kr.hi.travel_community.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final InquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;

    public List<Map<String, Object>> getAllInquiries() {
        return inquiryRepository.findAllByOrderByIbNumDesc().stream()
                .map(this::toInquiryMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllReports() {
        return reportRepository.findAllByOrderByRbNumDesc().stream()
                .map(this::toReportMap)
                .collect(Collectors.toList());
    }

    public void updateInquiryStatus(Integer ibNum, String status) {
        InquiryBox ib = inquiryRepository.findById(ibNum).orElse(null);
        if (ib != null) {
            ib.setIbStatus(status);
            inquiryRepository.save(ib);
        }
    }

    public void updateInquiryReply(Integer ibNum, String reply) {
        InquiryBox ib = inquiryRepository.findById(ibNum).orElse(null);
        if (ib != null) {
            ib.setIbReply(reply);
            ib.setIbStatus("Y");
            inquiryRepository.save(ib);
        }
    }

    public void updateReportStatus(Integer rbNum, String status) {
        ReportBox rb = reportRepository.findById(rbNum).orElse(null);
        if (rb != null) {
            rb.setRbManage(status);
            reportRepository.save(rb);
        }
    }

    public void updateReportReply(Integer rbNum, String reply) {
        ReportBox rb = reportRepository.findById(rbNum).orElse(null);
        if (rb != null) {
            rb.setRbReply(reply);
            rb.setRbManage("Y");
            reportRepository.save(rb);
        }
    }

    private Map<String, Object> toInquiryMap(InquiryBox ib) {
        Map<String, Object> m = new HashMap<>();
        m.put("ibNum", ib.getIbNum());
        m.put("ibTitle", ib.getIbTitle());
        m.put("ibContent", ib.getIbContent());
        m.put("ibReply", ib.getIbReply());
        m.put("ibDate", ib.getIbDate());
        m.put("ibStatus", ib.getIbStatus());
        m.put("ibMbNum", ib.getIbMbNum());
        return m;
    }

    private Map<String, Object> toReportMap(ReportBox rb) {
        Map<String, Object> m = new HashMap<>();
        m.put("rbNum", rb.getRbNum());
        m.put("rbContent", rb.getRbContent());
        m.put("rbReply", rb.getRbReply());
        m.put("rbManage", rb.getRbManage());
        m.put("rbId", rb.getRbId());
        m.put("rbName", rb.getRbName());
        m.put("rbMbNum", rb.getRbMbNum());
        return m;
    }
}
