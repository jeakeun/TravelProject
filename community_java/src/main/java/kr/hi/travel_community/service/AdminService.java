package kr.hi.travel_community.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.travel_community.entity.InquiryBox;
import kr.hi.travel_community.entity.ReportBox;
import kr.hi.travel_community.repository.FreeRepository;
import kr.hi.travel_community.repository.InquiryRepository;
import kr.hi.travel_community.repository.RecommendRepository;
import kr.hi.travel_community.repository.ReportRepository;
import kr.hi.travel_community.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final InquiryRepository inquiryRepository;
    private final ReportRepository reportRepository;
    private final RecommendRepository recommendRepository;
    private final ReviewRepository reviewRepository;
    private final FreeRepository freeRepository;

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

    @Transactional
    public void updateInquiryReply(Integer ibNum, String reply) {
        inquiryRepository.updateReplyAndStatus(ibNum, reply != null ? reply : "");
    }

    public void updateReportStatus(Integer rbNum, String status) {
        ReportBox rb = reportRepository.findById(rbNum).orElse(null);
        if (rb != null) {
            rb.setRbManage(status);
            reportRepository.save(rb);
        }
    }

    /** 신고 처리: action = Y(처리완료), D(삭제), H(보류) */
    @Transactional
    public void processReport(Integer rbNum, String action) {
        ReportBox rb = reportRepository.findById(rbNum).orElse(null);
        if (rb == null) return;
        rb.setRbManage(action != null ? action : "Y");
        reportRepository.save(rb);
        if ("D".equals(action)) {
            deleteReportedContent(rb.getRbName(), rb.getRbId());
        }
    }

    private void deleteReportedContent(String rbName, Integer rbId) {
        if (rbId == null) return;
        try {
            if ("RECOMMEND".equals(rbName)) {
                recommendRepository.findByPoNumAndPoDel(rbId, "N").ifPresent(p -> {
                    p.setPoDel("Y");
                    recommendRepository.save(p);
                });
            } else if ("REVIEW".equals(rbName) || "REVIEWBOARD".equals(rbName)) {
                reviewRepository.findByPoNumAndPoDel(rbId, "N").ifPresent(p -> {
                    p.setPoDel("Y");
                    reviewRepository.save(p);
                });
            } else if ("FREE".equals(rbName) || "FREEBOARD".equals(rbName)) {
                freeRepository.findByPoNumAndPoDel(rbId, "N").ifPresent(p -> {
                    p.setPoDel("Y");
                    freeRepository.save(p);
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void updateReportReply(Integer rbNum, String reply) {
        ReportBox rb = reportRepository.findById(rbNum).orElse(null);
        if (rb != null) {
            rb.setRbReply(reply);
            reportRepository.save(rb);
        }
    }

    private Map<String, Object> toInquiryMap(InquiryBox ib) {
        Map<String, Object> m = new HashMap<>();
        m.put("ibNum", ib.getIbNum());
        m.put("ibTitle", ib.getIbTitle() != null ? ib.getIbTitle() : "");
        m.put("ibContent", ib.getIbContent() != null ? ib.getIbContent() : "");
        m.put("ibReply", ib.getIbReply() != null ? ib.getIbReply() : "");
        m.put("ibDate", ib.getIbDate());
        m.put("ibStatus", ib.getIbStatus() != null ? ib.getIbStatus() : "N");
        m.put("ibMbNum", ib.getIbMbNum());
        return m;
    }

    private Map<String, Object> toReportMap(ReportBox rb) {
        Map<String, Object> m = new HashMap<>();
        m.put("rbNum", rb.getRbNum());
        m.put("rbContent", rb.getRbContent() != null ? rb.getRbContent() : "");
        m.put("rbReply", rb.getRbReply() != null ? rb.getRbReply() : "");
        m.put("rbManage", rb.getRbManage() != null ? rb.getRbManage() : "N");
        m.put("rbId", rb.getRbId());
        m.put("rbName", rb.getRbName() != null ? rb.getRbName() : "");
        m.put("rbMbNum", rb.getRbMbNum());
        return m;
    }
}
