'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Zap, Gift, Trophy, Calendar, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import RaffleEntryModal from './RaffleEntryModal';
import { useRaffleCurrentCycle, useRafflePastWinners } from '@/api/hooks/useRaffle';

const RaffleWrapper = styled.section`
  background: linear-gradient(135deg, #5b4dff 0%, #8b5fff 100%);
  padding: 60px 20px;
  margin: 80px 0;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(91, 77, 255, 0.2);

  @media (max-width: 768px) {
    padding: 40px 20px;
    margin: 60px 0;
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 500px;
    height: 500px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -30%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const Content = styled.div`
  text-align: center;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Title = styled.h2`
  font-size: 42px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto 30px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CTASection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const CTAButton = styled.button`
  background: white;
  color: #5b4dff;
  border: none;
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    padding: 14px 30px;
    font-size: 15px;
  }
`;

const Disclaimer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  backdrop-filter: blur(10px);

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    gap: 15px;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 28px;
    height: 28px;
    color: white;
    margin: 0 auto 10px;
  }
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

const WinnersSection = styled.div`
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const WinnerTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const WinnersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const WinnerCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const WinnerName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const WinnerDate = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const CountdownContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const TimeUnit = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  min-width: 60px;

  @media (max-width: 768px) {
    min-width: 50px;
    padding: 6px 10px;
  }
`;

const TimeValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TimeLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
`;

const RaffleSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { data: cycle, isLoading: cycleLoading } = useRaffleCurrentCycle();
  const { data: winners } = useRafflePastWinners(5);

  // Update countdown timer
  useEffect(() => {
    if (!cycle?.endDate) return;

    const timer = setInterval(() => {
      const endDate = new Date(cycle.endDate).getTime();
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / 1000 / 60) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cycle?.endDate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <RaffleWrapper>
        <Container>
          <Content>
            <Badge>
              <Zap />
              Weekly Giveaway
            </Badge>

            <Title>
              Win a FREE Sphere of Kings Board! 🏆
            </Title>

            <Subtitle>
              Every bi-weekly cycle, one lucky customer wins an exclusive SphereKings premium board. 
              Entry is just $1 – low cost, life-changing opportunity!
            </Subtitle>
          </Content>

          {/* Countdown */}
          {cycle && (
            <CountdownContainer>
              <TimeUnit>
                <TimeValue>{timeLeft.days}</TimeValue>
                <TimeLabel>Days</TimeLabel>
              </TimeUnit>
              <TimeUnit>
                <TimeValue>{timeLeft.hours}</TimeValue>
                <TimeLabel>Hours</TimeLabel>
              </TimeUnit>
              <TimeUnit>
                <TimeValue>{timeLeft.minutes}</TimeValue>
                <TimeLabel>Mins</TimeLabel>
              </TimeUnit>
              <TimeUnit>
                <TimeValue>{timeLeft.seconds}</TimeValue>
                <TimeLabel>Secs</TimeLabel>
              </TimeUnit>
            </CountdownContainer>
          )}

          {/* Stats */}
          <StatsGrid>
            <StatCard>
              <Gift />
              <StatValue>${cycle?.totalRevenue || '0.00'}</StatValue>
              <StatLabel>Pot Value</StatLabel>
            </StatCard>
            <StatCard>
              <Calendar />
              <StatValue>{cycle?.totalEntries || 0}</StatValue>
              <StatLabel>Total Entries</StatLabel>
            </StatCard>
            <StatCard>
              <Zap />
              <StatValue>
                {cycle?.totalEntries ? ((1 / cycle.totalEntries) * 100).toFixed(2) : '0'}%
              </StatValue>
              <StatLabel>Win Odds</StatLabel>
            </StatCard>
          </StatsGrid>

          {/* CTA */}
          <CTASection>
            <CTAButton onClick={() => setShowModal(true)}>
              Enter Raffle Now
              <ArrowRight />
            </CTAButton>

            <Disclaimer>
              <AlertCircle />
              <span>
                $1 raffle entry includes management fee. Shipping is free to the US & select countries.
                See{' '}
                <strong>official rules</strong>{' '}
                for eligibility and terms.
              </span>
            </Disclaimer>
          </CTASection>

          {/* Past Winners */}
          {winners && winners.length > 0 && (
            <WinnersSection>
              <WinnerTitle>
                <Trophy />
                Recent Winners
              </WinnerTitle>
              <WinnersList>
                {winners.map((winner, idx) => (
                  <WinnerCard key={idx}>
                    <WinnerName>
                      {winner.firstName}
                    </WinnerName>
                    <WinnerDate>
                      {formatDate(winner.announcedAt)}
                    </WinnerDate>
                  </WinnerCard>
                ))}
              </WinnersList>
            </WinnersSection>
          )}
        </Container>
      </RaffleWrapper>

      {/* Entry Modal */}
      <RaffleEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        cycle={cycle}
      />
    </>
  );
};

export default RaffleSection;
