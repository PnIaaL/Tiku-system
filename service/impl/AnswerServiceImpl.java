package com.java.bank.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.java.bank.entity.Answer;
import com.java.bank.mapper.AnswerMapper;
import com.java.bank.service.AnswerService;
import org.springframework.stereotype.Service;


@Service
public class AnswerServiceImpl extends ServiceImpl<AnswerMapper, Answer> implements AnswerService {
}
