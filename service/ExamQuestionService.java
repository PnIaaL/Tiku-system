package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.ExamQuestion;

public interface ExamQuestionService extends IService<ExamQuestion> {

    ExamQuestion getExamQuestionByExamId(Integer examId);

}
